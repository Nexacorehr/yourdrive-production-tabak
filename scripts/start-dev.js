#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs";
import net from "net";
import os from "os";
import path from "path";

const root = path.resolve();
const isWin = process.platform === "win32";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

const services = [];
let shuttingDown = false;
let startupPrinted = false;
let sigintCount = 0;
let resolvedApiPort = 3000;
let resolvedWebPort = 5173;
const fallbackNotes = [];

function log(message, color = colors.magenta) {
  console.log(`${color}[dev]${colors.reset} ${message}`);
}

function detectStructure() {
  const combos = [
    { api: "apps/api", web: "apps/web" },
    { api: "api", web: "web" },
    { api: "api", web: "client" },
  ];
  return combos.find(
    (s) =>
      fs.existsSync(path.join(root, s.api)) &&
      fs.existsSync(path.join(root, s.web)),
  );
}

function npmCommand() {
  return isWin ? "npm" : "npm";
}

function parsePort(rawValue, fallback) {
  const parsed = Number.parseInt(String(rawValue ?? fallback), 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 65535) return fallback;
  return parsed;
}

function canBindPort(port, host = "0.0.0.0") {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(preferredPort, label, maxAttempts = 25) {
  for (let offset = 0; offset <= maxAttempts; offset += 1) {
    const candidate = preferredPort + offset;
    // eslint-disable-next-line no-await-in-loop
    const available = await canBindPort(candidate);
    if (available) {
      if (candidate !== preferredPort) {
        fallbackNotes.push(
          `${label} port ${preferredPort} is busy, using ${candidate}.`,
        );
      }
      return candidate;
    }
  }
  throw new Error(
    `Could not find an open port for ${label} near ${preferredPort}.`,
  );
}

function getLanHosts() {
  const nets = os.networkInterfaces();
  const hosts = [];
  for (const entries of Object.values(nets)) {
    if (!entries) continue;
    for (const info of entries) {
      if (info.family === "IPv4" && !info.internal) {
        hosts.push(info.address);
      }
    }
  }
  return Array.from(new Set(hosts));
}

function printDashboard() {
  if (startupPrinted) return;
  startupPrinted = true;

  const webPort = resolvedWebPort;
  const apiPort = resolvedApiPort;
  const hosts = getLanHosts();

  const localWeb = `http://localhost:${webPort}`;
  const localApi = `http://localhost:${apiPort}`;

  const lines = [
    "YourDrive Development",
    `Web (local):       ${localWeb}`,
    `API (local):       ${localApi}`,
    `Health check:      ${localApi}/api/health`,
    `Tryout link flow:  ${localWeb}/s/<shortId>`,
  ];

  if (hosts.length > 0) {
    lines.push(...hosts.map((ip, idx) => {
      if (idx === 0) return `Web (LAN):         http://${ip}:${webPort}`;
      return `                   http://${ip}:${webPort}`;
    }));
    lines.push(...hosts.map((ip, idx) => {
      if (idx === 0) return `API (LAN):         http://${ip}:${apiPort}`;
      return `                   http://${ip}:${apiPort}`;
    }));
  }

  lines.push(" ");
  if (fallbackNotes.length > 0) {
    lines.push("Safe fallback:");
    for (const note of fallbackNotes) lines.push(`  ${note}`);
    lines.push(" ");
  }
  lines.push(" ");
  lines.push("Controls:");
  lines.push("  Ctrl+C once  -> graceful shutdown");
  lines.push("  Ctrl+C twice -> force exit");
  lines.push(" ");
  lines.push("Useful commands:");
  lines.push("  npm run dev:api   (API only)");
  lines.push("  npm run dev:web   (Web only)");
  lines.push("  npm run db:push   (sync schema)");

  const width = Math.max(...lines.map((l) => l.length));
  const border = "-".repeat(width + 2);
  console.log(`\n+${border}+`);
  for (const line of lines) {
    console.log(`| ${line.padEnd(width)} |`);
  }
  console.log(`+${border}+\n`);
}

function startService(name, cwd, args = ["run", "dev"], envOverrides = {}) {
  log(`Starting ${name} in ${path.relative(root, cwd)}...`, colors.cyan);
  const child = spawn(npmCommand(), args, {
    cwd,
    env: { ...process.env, ...envOverrides },
    stdio: "inherit",
    shell: isWin,
    windowsHide: true,
  });

  const record = { name, cwd, child };
  services.push(record);

  child.on("error", (err) => {
    log(`${name} failed to spawn: ${err.message}`, colors.red);
    if (!shuttingDown) void shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    if (code === 0) {
      log(`${name} exited cleanly. Stopping dev environment...`, colors.yellow);
    } else {
      log(
        `${name} exited unexpectedly (code=${code ?? "null"}, signal=${signal ?? "none"}).`,
        colors.red,
      );
    }
    void shutdown(code && code !== 0 ? 1 : 0);
  });

  return record;
}

async function taskkillTree(pid) {
  if (!pid) return;
  await new Promise((resolve) => {
    const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
      shell: false,
    });
    killer.on("close", () => resolve());
    killer.on("error", () => resolve());
  });
}

async function stopService(service) {
  const { name, child } = service;
  if (!child || child.killed || child.exitCode !== null) return;

  log(`Stopping ${name}...`, colors.yellow);

  if (isWin) {
    await taskkillTree(child.pid);
    return;
  }

  try {
    child.kill("SIGTERM");
  } catch {
    return;
  }

  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {}
      resolve();
    }, 2500);

    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  log("Shutting down development services...", colors.yellow);
  await Promise.all(services.map(stopService));
  log("Cleanup complete. Terminal is ready.", colors.green);
  process.exit(exitCode);
}

function attachSignalHandlers() {
  process.on("SIGINT", () => {
    sigintCount += 1;
    if (sigintCount > 1) {
      log("Force exit requested.", colors.red);
      process.exit(1);
    }
    void shutdown(0);
  });

  process.on("SIGTERM", () => void shutdown(0));
  process.on("SIGHUP", () => void shutdown(0));

  process.on("unhandledRejection", (reason) => {
    log(`Unhandled rejection: ${String(reason)}`, colors.red);
    void shutdown(1);
  });

  process.on("uncaughtException", (err) => {
    log(`Uncaught exception: ${err.message}`, colors.red);
    void shutdown(1);
  });
}

async function main() {
  console.clear();
  log("Booting YourDrive development environment...", colors.cyan);

  const structure = detectStructure();
  if (!structure) {
    log("Could not detect project structure (api/web).", colors.red);
    process.exit(1);
  }

  attachSignalHandlers();

  const preferredApiPort = parsePort(
    process.env.API_PORT ?? process.env.PORT,
    3000,
  );
  resolvedApiPort = await findAvailablePort(preferredApiPort, "API");

  const preferredWebPort = parsePort(process.env.WEB_PORT, 5173);
  resolvedWebPort = await findAvailablePort(preferredWebPort, "Web");
  if (resolvedWebPort === resolvedApiPort) {
    resolvedWebPort = await findAvailablePort(
      resolvedWebPort + 1,
      "Web",
      40,
    );
  }

  if (fallbackNotes.length > 0) {
    for (const note of fallbackNotes) log(note, colors.yellow);
  }

  startService("API", path.join(root, structure.api), ["run", "dev"], {
    PORT: String(resolvedApiPort),
  });
  setTimeout(
    () =>
      startService("Web", path.join(root, structure.web), ["run", "dev"], {
        PORT: String(resolvedWebPort),
        WEB_PORT: String(resolvedWebPort),
        API_PROXY_TARGET:
          process.env.API_PROXY_TARGET ??
          `http://localhost:${resolvedApiPort}`,
      }),
    700,
  );
  setTimeout(() => printDashboard(), 2200);
}

void main();
