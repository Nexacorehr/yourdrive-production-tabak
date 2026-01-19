import { useState, useEffect } from "react";
import styled from "styled-components";
import { FileText, Download, AlertCircle, Loader2 } from "lucide-react";
import { documentExtensions } from "../../utils/FileTypeDetector";

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
  background: #ffffff;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
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
    }
  `
      : `
    color: #202124;
    background: transparent;
    
    &:hover {
      background: #f1f3f4;
    }
  `}
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  background: #ffffff;
`;

const IFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
`;

const TextContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #ffffff;
  padding: 2rem;
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
  background: #ffffff;
`;

const LoadingContainer = styled(CenteredContainer)`
  gap: 0.75rem;
`;

const ErrorContainer = styled(CenteredContainer)`
  gap: 0.75rem;
  color: #d93025;
`;

const UnsupportedContainer = styled(CenteredContainer)`
  color: #5f6368;
`;

const Title = styled.p`
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  color: #202124;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #5f6368;
  margin: 0 0 1rem 0;
`;

const IconWrapper = styled.div<{ $size?: string; $color?: string }>`
  width: ${(props) => props.$size || "3rem"};
  height: ${(props) => props.$size || "3rem"};
  color: ${(props) => props.$color || "#9ca3af"};
  margin-bottom: 1rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const SpinningIcon = styled(IconWrapper)`
  color: #1a73e8;

  svg {
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

  const getFileExtension = (name: string): string => {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const loadDocument = async () => {
    setLoading(true);
    setError(null);

    const ext = getFileExtension(fileName);
    setFileType(ext);

    try {
      if (ext === "pdf") {
        setLoading(false);
        return;
      }

      if (["txt", "md", "json", "xml", "csv", "log"].includes(ext)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load document");

        // Properly decode UTF-8 text
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(arrayBuffer);

        setContent(text);
        setLoading(false);
        return;
      }

      if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
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

    if (["txt", "md", "json", "xml", "csv", "log"].includes(fileType)) {
      return (
        <TextContainer>
          <PreFormatted>{content}</PreFormatted>
        </TextContainer>
      );
    }

    if (documentExtensions.includes(fileType)) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        url,
      )}&embedded=true`;
      return <IFrame src={viewerUrl} title={fileName} />;
    }

    return (
      <UnsupportedContainer>
        <IconWrapper $size="4rem">
          <FileText />
        </IconWrapper>
        <Title>Preview not available</Title>
        <Subtitle>This file type cannot be previewed in the browser</Subtitle>
        {onDownload && (
          <Button $primary onClick={onDownload}>
            <Download size={16} />
            Download to view
          </Button>
        )}
      </UnsupportedContainer>
    );
  };

  useEffect(() => {
    loadDocument();
  }, [url]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <SpinningIcon>
            <Loader2 />
          </SpinningIcon>
          <Subtitle>Loading document...</Subtitle>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
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
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Content>{renderContent()}</Content>
    </Container>
  );
}
