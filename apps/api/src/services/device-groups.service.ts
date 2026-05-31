import type { Pool } from "pg";

const DEFAULT_GROUPS = [
  { name: "Personal", description: "Your personal devices", icon: "user", color: "#667eea" },
  { name: "Work", description: "Work and school devices", icon: "briefcase", color: "#0ea5e9" },
  { name: "Shared", description: "Shared household devices", icon: "users", color: "#22c55e" },
] as const;

export async function ensureDeviceGroupsSchema(pool: Pool): Promise<boolean> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_groups (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT 'folder',
      color TEXT DEFAULT '#667eea',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_group_members (
      id SERIAL PRIMARY KEY,
      device_id TEXT NOT NULL REFERENCES user_devices(id) ON DELETE CASCADE,
      group_id INTEGER NOT NULL REFERENCES device_groups(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE (device_id, group_id)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS device_groups_user_idx ON device_groups(user_id);
  `);

  return true;
}

export async function seedDefaultDeviceGroups(
  pool: Pool,
  userId: string,
): Promise<void> {
  await ensureDeviceGroupsSchema(pool);

  const existing = await pool.query(
    `SELECT COUNT(*)::int AS count FROM device_groups WHERE user_id = $1`,
    [userId],
  );

  if ((existing.rows[0]?.count ?? 0) > 0) {
    return;
  }

  for (const group of DEFAULT_GROUPS) {
    await pool.query(
      `INSERT INTO device_groups (user_id, name, description, icon, color)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, group.name, group.description, group.icon, group.color],
    );
  }
}
