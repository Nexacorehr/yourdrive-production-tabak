import { useState, useEffect } from "react";
import styled from "styled-components";
import { FileText, Download, AlertCircle, Loader2 } from "lucide-react";

interface DocumentViewerProps {
  url: string;
  fileName: string;
  onEdit?: () => void;
  onDownload?: () => void;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #e9eef6;
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  background: #e9eef6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const IFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TextContainer = styled.div`
  width: 100%;
  height: 100%;
  max-width: 1200px;
  overflow: auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PreFormatted = styled.pre`
  font-size: 14px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-word;
  color: #202124;
  background: #ffffff;
  margin: 0;
  line-height: 1.6;
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #e9eef6;
  gap: 1rem;
`;

const IconWrapper = styled.div<{ $size?: string; $color?: string }>`
  width: ${(props) => props.$size || "3rem"};
  height: ${(props) => props.$size || "3rem"};
  color: ${(props) => props.$color || "#5f6368"};

  svg {
    width: 100%;
    height: 100%;
  }

  &.spinning svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Title = styled.p`
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
  color: #202124;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #5f6368;
  margin: 0.5rem 0;
  text-align: center;
  max-width: 400px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$primary
      ? `
    color: white;
    background: #1a73e8;
    
    &:hover {
      background: #1557b0;
      box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
    }
  `
      : `
    color: #202124;
    background: white;
    border: 1px solid #dadce0;
    
    &:hover {
      background: #f8f9fa;
    }
  `}

  &:active {
    transform: scale(0.98);
  }
`;

const ViewerWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ViewerNotice = styled.div`
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: rgba(234, 134, 0, 0.95);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
`;

const NoticeText = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
`;

const NoticeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: white;
  color: #ea8600;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const FileName = styled.div`
  font-size: 0.875rem;
  color: #202124;
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-family: monospace;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0.5rem 0;
  border: 1px solid #dadce0;
`;

const InfoBox = styled.div`
  background: white;
  border: 1px solid #dadce0;
  border-radius: 0.5rem;
  padding: 1rem;
  max-width: 500px;
  margin: 1rem 0;
  text-align: left;
`;

const InfoTitle = styled.div`
  color: #202124;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
`;

const InfoText = styled.div`
  color: #5f6368;
  font-size: 0.8125rem;
  line-height: 1.5;
  margin-bottom: 0.375rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export default function DocumentViewer({
  url,
  fileName,
  onEdit,
  onDownload,
}: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [viewerFailed, setViewerFailed] = useState(false);

  const getFileExtension = (name: string): string => {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const loadDocument = async () => {
    setLoading(true);
    setError(null);

    const ext = getFileExtension(fileName);
    setFileType(ext);

    const textFormats = [
      // Plain text & markup
      "txt",
      "text",
      "md",
      "markdown",
      "rst",
      "asciidoc",
      "textile",
      // Data formats
      "json",
      "xml",
      "yaml",
      "yml",
      "toml",
      "ini",
      "cfg",
      "conf",
      // Web formats
      "html",
      "htm",
      "css",
      "scss",
      "sass",
      "less",
      // Documentation
      "log",
      "csv",
      "tsv",
      // Config files
      "env",
      "gitignore",
      "dockerignore",
      "editorconfig",
    ];

    // Office document formats (Google Viewer)
    const officeFormats = [
      // Microsoft Office
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      // OpenDocument
      "odt",
      "ods",
      "odp",
      "odg",
      "odf",
      // Other document formats
      "rtf",
      "pages",
      "numbers",
      "key",
    ];

    // E-book and specialized document formats
    const ebookFormats = ["epub", "mobi", "azw", "fb2"];

    try {
      if (ext === "pdf") {
        setLoading(false);
        return;
      }

      // Handle text-based files with proper UTF-8 decoding (supports č, ć, ž, etc.)
      if (textFormats.includes(ext)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load document");

        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(arrayBuffer);

        setContent(text);
        setLoading(false);
        return;
      }

      // Office and OpenDocument formats
      if (officeFormats.includes(ext)) {
        setLoading(false);
        return;
      }

      // E-book formats
      if (ebookFormats.includes(ext)) {
        setLoading(false);
        return;
      }

      // Archive formats - cannot preview
      if (["tar", "gz", "zip", "rar", "7z", "bz2", "xz"].includes(ext)) {
        setError(
          `${ext.toUpperCase()} archives cannot be previewed. Please download to extract.`,
        );
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (fileType === "pdf") {
      return <IFrame src={`${url}#view=FitH`} title={fileName} />;
    }

    // Text-based formats with UTF-8 support
    const textFormats = [
      "txt",
      "text",
      "md",
      "markdown",
      "rst",
      "asciidoc",
      "textile",
      "json",
      "xml",
      "yaml",
      "yml",
      "toml",
      "ini",
      "cfg",
      "conf",
      "html",
      "htm",
      "css",
      "scss",
      "sass",
      "less",
      "log",
      "csv",
      "tsv",
      "env",
      "gitignore",
      "dockerignore",
      "editorconfig",
    ];

    if (textFormats.includes(fileType)) {
      return (
        <TextContainer>
          <PreFormatted>{content}</PreFormatted>
        </TextContainer>
      );
    }

    // Office documents and OpenDocument formats
    // Google Viewer and Office Online often fail due to CORS - direct download is more reliable
    const officeFormats = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
    const openDocFormats = ["odt", "ods", "odp", "odg", "odf"];

    if (officeFormats.includes(fileType) || openDocFormats.includes(fileType)) {
      return (
        <CenteredContainer>
          <IconWrapper $size="4rem" $color="#1a73e8">
            <FileText />
          </IconWrapper>
          <Title>{fileType.toUpperCase()} Document</Title>
          <Subtitle>
            Office documents cannot be previewed directly in the browser due to
            security restrictions
          </Subtitle>
          <FileName>{fileName}</FileName>
          <InfoBox>
            <InfoTitle>How to view this file:</InfoTitle>
            <InfoText>• Download the file to your computer</InfoText>
            <InfoText>
              • Open with Microsoft Office, LibreOffice, or Google Docs
            </InfoText>
            <InfoText>
              • Or upload to a cloud service for online viewing
            </InfoText>
          </InfoBox>
          <ButtonGroup>
            {onDownload && (
              <Button $primary onClick={onDownload}>
                <Download size={16} />
                Download {fileType.toUpperCase()}
              </Button>
            )}
            <Button onClick={() => window.open(url, "_blank")}>
              Open in new tab
            </Button>
          </ButtonGroup>
        </CenteredContainer>
      );
    }

    // RTF and other document formats
    if (fileType === "rtf" || fileType === "epub") {
      return (
        <CenteredContainer>
          <IconWrapper $size="4rem">
            <FileText />
          </IconWrapper>
          <Title>{fileType.toUpperCase()} Document</Title>
          <Subtitle>
            This file format requires specialized software to view
          </Subtitle>
          <FileName>{fileName}</FileName>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download to view
            </Button>
          )}
        </CenteredContainer>
      );
    }

    return (
      <CenteredContainer>
        <IconWrapper $size="4rem">
          <FileText />
        </IconWrapper>
        <Title>Preview not available</Title>
        <Subtitle>This file type cannot be previewed in the browser</Subtitle>
        <FileName>{fileName}</FileName>
        {onDownload && (
          <Button $primary onClick={onDownload}>
            <Download size={16} />
            Download to view
          </Button>
        )}
      </CenteredContainer>
    );
  };

  useEffect(() => {
    loadDocument();
  }, [url]);

  if (loading) {
    return (
      <Container>
        <CenteredContainer>
          <IconWrapper className="spinning">
            <Loader2 />
          </IconWrapper>
          <Subtitle>Loading document...</Subtitle>
        </CenteredContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <CenteredContainer>
          <IconWrapper $size="3rem" $color="#d93025">
            <AlertCircle />
          </IconWrapper>
          <Title>Failed to load document</Title>
          <Subtitle>{error}</Subtitle>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download file
            </Button>
          )}
        </CenteredContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Content>{renderContent()}</Content>
    </Container>
  );
}
