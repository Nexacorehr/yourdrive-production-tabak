import type { PoolClient } from "pg";
import {
  assertValidFolderName,
  getFolderBaseName,
  getParentFolderPath,
  isPathUnder,
  joinFolderPath,
  normalizeFolderPath,
} from "../lib/folder-path";

function folderMetadataKey(userId: string, folderPath: string): string {
  return `${userId}/${normalizeFolderPath(folderPath)}/.metadata`;
}

/** Updates a folder subtree when its root path changes (rename or move). */
export async function replaceFolderPathPrefix(
  client: PoolClient,
  userId: string,
  oldPrefix: string,
  newPrefix: string,
): Promise<void> {
  const oldPath = normalizeFolderPath(oldPrefix);
  const newPath = normalizeFolderPath(newPrefix);
  if (oldPath === newPath) return;

  await client.query(
    `UPDATE user_files
     SET folder_path = $1,
         s3_key = $2,
         updated_at = NOW()
     WHERE user_id = $3 AND is_folder = true AND folder_path = $4`,
    [newPath, folderMetadataKey(userId, newPath), userId, oldPath],
  );

  await client.query(
    `UPDATE user_files
     SET folder_path = $1 || SUBSTRING(folder_path FROM $2 + 1),
         s3_key = $3 || $1 || SUBSTRING(folder_path FROM $2 + 1) || '/.metadata',
         updated_at = NOW()
     WHERE user_id = $4
       AND is_folder = true
       AND folder_path LIKE $5
       AND folder_path <> $6`,
    [
      `${newPath}/`,
      oldPath.length + 1,
      `${userId}/`,
      userId,
      `${oldPath}/%`,
      oldPath,
    ],
  );

  await client.query(
    `UPDATE user_files
     SET folder_path = $1,
         updated_at = NOW()
     WHERE user_id = $2 AND is_folder = false AND folder_path = $3`,
    [newPath, userId, oldPath],
  );

  await client.query(
    `UPDATE user_files
     SET folder_path = $1 || SUBSTRING(folder_path FROM $2 + 1),
         updated_at = NOW()
     WHERE user_id = $3
       AND is_folder = false
       AND folder_path LIKE $4`,
    [`${newPath}/`, oldPath.length + 1, userId, `${oldPath}/%`],
  );
}

export async function renameFolderById(
  client: PoolClient,
  userId: string,
  folderId: number,
  newName: string,
): Promise<{ oldPath: string; newPath: string }> {
  assertValidFolderName(newName);

  const meta = await client.query(
    `SELECT folder_path FROM user_files
     WHERE id = $1 AND user_id = $2 AND is_folder = true`,
    [folderId, userId],
  );
  if (meta.rows.length === 0) {
    throw new Error("Folder not found");
  }

  const oldPath = normalizeFolderPath(meta.rows[0].folder_path);
  const parent = getParentFolderPath(oldPath);
  const newPath = joinFolderPath(parent, newName);

  if (newPath === oldPath) {
    return { oldPath, newPath };
  }

  const collision = await client.query(
    `SELECT id FROM user_files
     WHERE user_id = $1 AND is_folder = true AND folder_path = $2`,
    [userId, newPath],
  );
  if (collision.rows.length > 0) {
    throw new Error("A folder with that name already exists");
  }

  await replaceFolderPathPrefix(client, userId, oldPath, newPath);
  return { oldPath, newPath };
}

export async function moveFolderById(
  client: PoolClient,
  userId: string,
  folderId: number,
  targetParentPath: string,
): Promise<{ oldPath: string; newPath: string }> {
  const targetParent = normalizeFolderPath(targetParentPath);

  const meta = await client.query(
    `SELECT folder_path FROM user_files
     WHERE id = $1 AND user_id = $2 AND is_folder = true`,
    [folderId, userId],
  );
  if (meta.rows.length === 0) {
    throw new Error("Folder not found");
  }

  const oldPath = normalizeFolderPath(meta.rows[0].folder_path);
  const folderName = getFolderBaseName(oldPath);
  const newPath = joinFolderPath(targetParent, folderName);

  if (newPath === oldPath) {
    return { oldPath, newPath };
  }

  if (targetParent && isPathUnder(targetParent, oldPath)) {
    throw new Error("Cannot move a folder into itself or its subfolder");
  }

  if (targetParent) {
    const parentExists = await client.query(
      `SELECT id FROM user_files
       WHERE user_id = $1 AND is_folder = true AND folder_path = $2`,
      [userId, targetParent],
    );
    if (parentExists.rows.length === 0) {
      throw new Error("Target folder does not exist");
    }
  }

  const collision = await client.query(
    `SELECT id FROM user_files
     WHERE user_id = $1 AND is_folder = true AND folder_path = $2`,
    [userId, newPath],
  );
  if (collision.rows.length > 0) {
    throw new Error("A folder with that name already exists in the destination");
  }

  await replaceFolderPathPrefix(client, userId, oldPath, newPath);
  return { oldPath, newPath };
}

/** All file/folder row ids in a folder subtree (including the folder row). */
export async function collectSubtreeFileIds(
  client: PoolClient,
  userId: string,
  folderPath: string,
): Promise<number[]> {
  const path = normalizeFolderPath(folderPath);
  const result = await client.query(
    `SELECT id FROM user_files
     WHERE user_id = $1
       AND (
         (is_folder = true AND (folder_path = $2 OR folder_path LIKE $3))
         OR (is_folder = false AND (folder_path = $2 OR folder_path LIKE $3))
       )`,
    [userId, path, `${path}/%`],
  );
  return result.rows.map((row) => Number(row.id));
}

export async function folderRowExists(
  client: PoolClient,
  userId: string,
  folderPath: string,
): Promise<boolean> {
  const path = normalizeFolderPath(folderPath);
  if (!path) return true;
  const result = await client.query(
    `SELECT id FROM user_files
     WHERE user_id = $1 AND is_folder = true AND folder_path = $2
     LIMIT 1`,
    [userId, path],
  );
  return result.rows.length > 0;
}

export interface FolderFileRow {
  s3_key: string;
  original_name: string;
  folder_path: string;
}

export function zipPathWithinFolder(
  folderRoot: string,
  fileFolderPath: string,
  fileName: string,
): string {
  const root = normalizeFolderPath(folderRoot);
  const parent = normalizeFolderPath(fileFolderPath);
  if (parent === root) return fileName;
  const relative = parent.slice(root.length + 1);
  return `${relative}/${fileName}`;
}

/** Collect non-folder files in a folder subtree for zip download. */
export async function collectSubtreeFileRows(
  client: PoolClient,
  userId: string,
  folderPath: string,
): Promise<{ folderName: string; files: FolderFileRow[] }> {
  const path = normalizeFolderPath(folderPath);
  const result = await client.query(
    `SELECT s3_key, original_name, folder_path FROM user_files
     WHERE user_id = $1
       AND is_folder = false
       AND original_name != '.metadata'
       AND (folder_path = $2 OR folder_path LIKE $3)`,
    [userId, path, `${path}/%`],
  );
  return {
    folderName: getFolderBaseName(path) || "folder",
    files: result.rows,
  };
}

export function buildFolderZipEntries(
  folderPath: string,
  files: FolderFileRow[],
  archivePrefix = "",
): Array<{ s3Key: string; archivePath: string }> {
  const root = normalizeFolderPath(folderPath);
  return files.map((file) => {
    const relative = zipPathWithinFolder(root, file.folder_path, file.original_name);
    const archivePath = archivePrefix ? `${archivePrefix}/${relative}` : relative;
    return { s3Key: file.s3_key, archivePath };
  });
}
