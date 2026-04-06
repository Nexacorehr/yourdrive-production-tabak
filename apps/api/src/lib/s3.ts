import { S3Client } from "@aws-sdk/client-s3";

/**
 * Single S3/B2 client for the API. Import from here — not from `files.routes` — to avoid circular module graphs.
 */
export const BUCKET_NAME = process.env.B2_BUCKET_NAME;

export const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: "eu-central-003",
  forcePathStyle: true,
  useArnRegion: false,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID ?? "",
    secretAccessKey: process.env.B2_APPLICATION_KEY ?? "",
  },
});
