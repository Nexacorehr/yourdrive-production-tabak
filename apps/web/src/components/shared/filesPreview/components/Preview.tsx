import DocumentViewer from "./previews/DocumentPreview";
import CodeEditor from "./previews/CodePreview";
import ImagePreview from "./previews/ImagePreview";
import VideoPreview from "./previews/VideoPreview";
import AudioPreview from "./previews/AudioPreview";
import UnsupportedState from "./previews/UnsupportedState";

interface PreviewRendererProps {
  type: string;
  common: {
    url: string;
    fileName: string;
    fileType: string;
    fileId?: string;
    onClose: () => void;
    onEdit?: () => void;
    onDownload?: () => void;
    onShare?: () => void;
  };
  files?: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  index?: number;
  onNavigate?: (index: number) => void;
}

export default function PreviewRenderer({
  type,
  common,
  files = [],
  index = 0,
  onNavigate,
}: PreviewRendererProps) {
  // Documents: PDF, Word, Excel, PowerPoint, OpenDocument, EPUB, DocBook
  if (type === "document" || type === "office") {
    return (
      <DocumentViewer
        url={common.url}
        fileName={common.fileName}
        onEdit={common.onEdit}
        onDownload={common.onDownload}
      />
    );
  }

  // Code files: all programming languages and text files
  if (type === "code") {
    return (
      <CodeEditor
        url={common.url}
        fileName={common.fileName}
        onEdit={
          common.onEdit
            ? (content) => {
                console.log("Content to save:", content);
              }
            : undefined
        }
        onDownload={common.onDownload}
      />
    );
  }

  // Images: JPEG, PNG, GIF, SVG, WebP, etc.
  if (type === "image") {
    return (
      <ImagePreview
        url={common.url}
        fileName={common.fileName}
        fileType={common.fileType}
        onClose={common.onClose}
        onEdit={common.onEdit}
        onDownload={common.onDownload}
        onShare={common.onShare}
        files={files}
        currentIndex={index}
        onNavigate={onNavigate || (() => {})}
      />
    );
  }

  // Video: MP4, WebM, AVI, MOV, etc.
  if (type === "video") {
    return (
      <VideoPreview
        url={common.url}
        fileName={common.fileName}
        fileType={common.fileType}
        onClose={common.onClose}
        onEdit={common.onEdit}
        onDownload={common.onDownload}
        onShare={common.onShare}
      />
    );
  }

  // Audio: MP3, WAV, OGG, FLAC, etc.
  if (type === "audio") {
    return (
      <AudioPreview
        url={common.url}
        fileName={common.fileName}
        fileType={common.fileType}
        onClose={common.onClose}
        onEdit={common.onEdit}
        onDownload={common.onDownload}
        onShare={common.onShare}
      />
    );
  }

  // Fallback for unsupported file types
  return (
    <UnsupportedState
      fileName={common.fileName}
      fileType={type}
      onDownload={common.onDownload}
    />
  );
}
