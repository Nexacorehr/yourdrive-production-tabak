import type { FileItem } from "../components/shared/files_table/FilesTable";

export function normalizeFolderPath(path: string | undefined | null): string {
  if (!path || path === "Your Files") return "";
  return path.trim().replace(/^\/+|\/+$/g, "").replace(/\\/g, "/");
}

export function isDirectChildFolder(
  folderFullPath: string,
  parentPath: string,
): boolean {
  const folder = normalizeFolderPath(folderFullPath);
  const parent = normalizeFolderPath(parentPath);
  if (!folder) return false;
  if (!parent) return !folder.includes("/");
  if (!folder.startsWith(`${parent}/`)) return false;
  const rest = folder.slice(parent.length + 1);
  return rest.length > 0 && !rest.includes("/");
}

export function isPathUnder(path: string, ancestor: string): boolean {
  const p = normalizeFolderPath(path);
  const a = normalizeFolderPath(ancestor);
  if (!a) return Boolean(p);
  return p === a || p.startsWith(`${a}/`);
}

export function getParentFolderPath(fullPath: string): string {
  const normalized = normalizeFolderPath(fullPath);
  const idx = normalized.lastIndexOf("/");
  return idx === -1 ? "" : normalized.slice(0, idx);
}

export function joinFolderPath(parent: string, name: string): string {
  const p = normalizeFolderPath(parent);
  const segment = name.trim();
  return p ? `${p}/${segment}` : segment;
}

export interface BreadcrumbSegment {
  label: string;
  path: string;
}

export function buildBreadcrumbSegments(path: string): BreadcrumbSegment[] {
  const normalized = normalizeFolderPath(path);
  if (!normalized) return [];
  const parts = normalized.split("/").filter(Boolean);
  const segments: BreadcrumbSegment[] = [];
  let acc = "";
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    segments.push({ label: part, path: acc });
  }
  return segments;
}

/** Items displayed when browsing a single folder level (folders first, then files). */
export function getItemsInFolder(
  allItems: FileItem[],
  currentPath: string,
): FileItem[] {
  const path = normalizeFolderPath(currentPath);
  const folders: FileItem[] = [];
  const files: FileItem[] = [];
  const seenFolderPaths = new Set<string>();

  for (const item of allItems) {
    if (item.type === "folder") {
      const fullPath = normalizeFolderPath(
        item.folderPath ?? item.location ?? item.name,
      );
      if (!isDirectChildFolder(fullPath, path)) continue;
      if (seenFolderPaths.has(fullPath)) continue;
      seenFolderPaths.add(fullPath);
      folders.push(item);
    } else {
      const parent = normalizeFolderPath(item.folderPath ?? item.location);
      if (parent === path) {
        files.push(item);
      }
    }
  }

  const byName = (a: FileItem, b: FileItem) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  return [...folders.sort(byName), ...files.sort(byName)];
}

export function resolveFolderOpenPath(item: FileItem): string {
  if (item.type !== "folder") return "";
  return normalizeFolderPath(item.folderPath ?? item.location ?? item.name);
}
