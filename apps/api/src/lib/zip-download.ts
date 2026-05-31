import archiver from "archiver";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { s3Client } from "./s3";
import { buildContentDisposition } from "./contentDisposition";

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

export interface ZipEntry {
  s3Key: string;
  archivePath: string;
}

export async function downloadFromS3(s3Key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const { Body } = await s3Client.send(command);
  if (!Body) {
    throw new Error("Failed to download file from S3");
  }

  if (Body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  if (Body instanceof Uint8Array) {
    return Buffer.from(Body);
  }

  const arrayBuffer = await (Body as { transformToByteArray(): Promise<Uint8Array> }).transformToByteArray();
  return Buffer.from(arrayBuffer);
}

export async function buildZipBuffer(
  entries: ZipEntry[],
  downloadFn: (s3Key: string) => Promise<Buffer> = downloadFromS3,
): Promise<Buffer> {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  const archivePromise = new Promise<Buffer>((resolve, reject) => {
    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });

  for (const entry of entries) {
    try {
      const fileBuffer = await downloadFn(entry.s3Key);
      archive.append(fileBuffer, { name: entry.archivePath });
    } catch (err) {
      console.error(`Failed to add ${entry.archivePath} to zip:`, err);
    }
  }

  await archive.finalize();
  return archivePromise;
}

export async function uploadZipAndGetSignedUrl(
  zipBuffer: Buffer,
  zipName: string,
  s3Key: string,
  expiresInSeconds = 300,
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: zipBuffer,
      ContentType: "application/zip",
    }),
  );

  const downloadCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ResponseContentDisposition: buildContentDisposition("attachment", zipName, true),
  });

  return getSignedUrl(s3Client, downloadCommand, { expiresIn: expiresInSeconds });
}
