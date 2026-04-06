import crypto from "crypto";
import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";

import { prisma } from "../lib/prisma";

function buildWelcomeS3Key(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(4).toString("hex");
  return `${userId}/${timestamp}-${randomStr}-${originalName}`;
}

const WELCOME_MARKDOWN = `# Welcome to YourDrive

This file was created automatically for you. It does **not** count toward your storage quota.

## What you can do

- Upload files and folders from the toolbar or drag-and-drop
- Organize content in folders and mark favorites for quick access
- Share files with secure links when you need to collaborate
- Open **Settings** to tune appearance, security, and storage preferences

## Tips

- Use the search and sidebar to move quickly across your drive
- Deleted items go to the recycle bin before permanent removal

You can edit this document anytime — just keep the filename **README.md** in the root of your drive so it stays linked to your welcome experience.

`;

export async function ensureWelcomeReadme(
  userId: string,
  s3: S3Client,
  bucket: string,
): Promise<{ created: boolean; fileId?: number }> {
  const existing = await prisma.userFile.findFirst({
    where: {
      userId,
      folderPath: "",
      deletedAt: null,
      originalName: { equals: "README.md", mode: "insensitive" },
    },
    select: { id: true },
  });

  if (existing) {
    return { created: false, fileId: existing.id };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) {
    throw new Error("User email not found");
  }

  const body = Buffer.from(WELCOME_MARKDOWN, "utf-8");
  const s3Key = buildWelcomeS3Key(userId, "README.md");

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: body,
      ContentType: "text/markdown; charset=utf-8",
    }),
  );

  const row = await prisma.userFile.create({
    data: {
      userId,
      userEmail: user.email,
      originalName: "README.md",
      s3Key,
      folderPath: "",
      size: BigInt(body.length),
      mimeType: "text/markdown; charset=utf-8",
      isFolder: false,
      isSystemReadme: true,
    },
    select: { id: true },
  });

  return { created: true, fileId: row.id };
}
