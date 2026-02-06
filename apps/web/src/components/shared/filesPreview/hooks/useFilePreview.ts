import { useCallback, useEffect, useMemo, useState } from "react";
import { getFileTypeInfo } from "../utils/FileTypeDetector";
import { useAuthStore } from "../../../../store/authStore";

interface UseFilePreviewArgs {
  fileId?: string;
  url?: string;
  fileName: string;
  mimeType?: string;
  options?: {
    generateThumbnail?: boolean;
    extractMetadata?: boolean;
    maxSize?: number;
  };
}

interface UseFilePreviewReturn {
  previewUrl: string;
  previewCategory:
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "text"
    | "code"
    | "document"
    | "office"
    | "archive"
    | "default";
  isLoading: boolean;
  error: string | null;
  metadata: Record<string, unknown> | null;
  refreshPreview: () => void;
}

export function useFilePreview({
  fileId,
  url,
  fileName,
  mimeType,
}: UseFilePreviewArgs): UseFilePreviewReturn {
  const accessToken = useAuthStore((s) => s.accessToken);
  const fileTypeInfo = useMemo(
    () => getFileTypeInfo(fileName, mimeType),
    [fileName, mimeType],
  );

  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshPreview = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If URL was provided (e.g. shared link), use it as-is.
        if (url) {
          setPreviewUrl(url);
          setMetadata(null);
          setIsLoading(false);
          return;
        }

        if (!fileId) {
          throw new Error("No file ID provided");
        }

        // Fetch-based previews need same-origin URL (avoid CORS for reading bytes)
        const needsAuthenticatedBlob =
          fileTypeInfo.previewCategory === "text" ||
          fileTypeInfo.previewCategory === "code" ||
          fileTypeInfo.previewCategory === "spreadsheet" ||
          fileTypeInfo.previewCategory === "document" ||
          fileTypeInfo.previewCategory === "archive";

        if (needsAuthenticatedBlob) {
          setPreviewUrl(`/api/files/blob/${fileId}`);
          setMetadata(null);
          setIsLoading(false);
          return;
        }

        // Media/iframe previews should use signed URL (no auth headers required)
        const response = await fetch(`/api/files/content/${fileId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(
            `Failed to load preview URL: ${response.status} ${response.statusText}${errText ? ` - ${errText}` : ""}`,
          );
        }

        const data = await response.json();
        if (!data?.signedUrl && !data?.url) {
          throw new Error("No URL returned from API");
        }

        setPreviewUrl(data.signedUrl || data.url);
        setMetadata(null);
        setIsLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load preview");
        setPreviewUrl("");
        setMetadata(null);
        setIsLoading(false);
      }
    };

    load();
  }, [fileId, url, fileName, mimeType, accessToken, refreshKey, fileTypeInfo]);

  return {
    previewUrl,
    previewCategory: fileTypeInfo.previewCategory,
    isLoading,
    error,
    metadata,
    refreshPreview,
  };
}

