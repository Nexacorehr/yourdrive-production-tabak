/** Normalize a logical folder path (no leading/trailing slashes). */
export function normalizeFolderPath(path: string | undefined | null): string {
  if (!path) return "";
  return path
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/+/g, "/");
}

export function getParentFolderPath(fullPath: string): string {
  const normalized = normalizeFolderPath(fullPath);
  const idx = normalized.lastIndexOf("/");
  return idx === -1 ? "" : normalized.slice(0, idx);
}

export function getFolderBaseName(fullPath: string): string {
  const normalized = normalizeFolderPath(fullPath);
  const idx = normalized.lastIndexOf("/");
  return idx === -1 ? normalized : normalized.slice(idx + 1);
}

export function joinFolderPath(parent: string, name: string): string {
  const parentPath = normalizeFolderPath(parent);
  const segment = name.trim().replace(/[/\\]/g, "");
  if (!segment) {
    throw new Error("Invalid folder name");
  }
  return parentPath ? `${parentPath}/${segment}` : segment;
}

/** True when `path` is `ancestor` or nested under it. */
export function isPathUnder(path: string, ancestor: string): boolean {
  const p = normalizeFolderPath(path);
  const a = normalizeFolderPath(ancestor);
  if (!a) return true;
  return p === a || p.startsWith(`${a}/`);
}

export function isDirectChildFolderPath(
  folderFullPath: string,
  parentPath: string,
): boolean {
  const folder = normalizeFolderPath(folderFullPath);
  const parent = normalizeFolderPath(parentPath);
  if (!folder) return false;
  if (!parent) {
    return !folder.includes("/");
  }
  if (!folder.startsWith(`${parent}/`)) return false;
  const rest = folder.slice(parent.length + 1);
  return rest.length > 0 && !rest.includes("/");
}

export const INVALID_FOLDER_NAME = /[<>:"/\\|?*\x00-\x1F]/;

export function assertValidFolderName(name: string): void {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 255) {
    throw new Error("Folder name must be between 1 and 255 characters");
  }
  if (INVALID_FOLDER_NAME.test(trimmed)) {
    throw new Error("Folder name contains invalid characters");
  }
}
