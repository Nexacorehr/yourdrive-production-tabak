import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Download, AlertCircle, Loader2, ExternalLink } from "lucide-react";

interface CodeEditorProps {
  url: string;
  fileName: string;
  onEdit?: (content: string) => void;
  onDownload?: () => void;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #e9eef6;
`;

const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  margin: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #1e1e1e;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  padding-left: 4.5rem;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
  border: none;
  outline: none;
  resize: none;
  tab-size: 2;

  &::selection {
    background: #264f78;
  }
`;

const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3.5rem;
  background: #1e1e1e;
  padding: 1.5rem 0;
  overflow: hidden;
  user-select: none;
  pointer-events: none;
  border-right: 1px solid #3e3e42;
`;

const LineNumber = styled.div`
  height: 1.6em;
  padding-right: 0.5rem;
  text-align: right;
  color: #858585;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
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

const IconWrapper = styled.div<{ $color?: string }>`
  width: 3rem;
  height: 3rem;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CorsWarning = styled.div`
  background: white;
  border: 1px solid #dadce0;
  border-radius: 0.5rem;
  padding: 1rem;
  max-width: 500px;
  margin-top: 0.5rem;
`;

const WarningTitle = styled.div`
  color: #202124;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const WarningText = styled.div`
  color: #5f6368;
  font-size: 0.875rem;
  line-height: 1.5;
`;

export default function CodeEditor({
  url,
  fileName,
  onEdit,
  onDownload,
}: CodeEditorProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorsError, setIsCorsError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadFile();
  }, [url]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    setIsCorsError(false);

    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load file: ${response.status} ${response.statusText}`,
        );
      }

      // Proper UTF-8 decoding to support special characters like č, ć, ž, š, đ
      const arrayBuffer = await response.arrayBuffer();
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(arrayBuffer);

      setContent(text);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load file";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("NetworkError") ||
        (err instanceof TypeError && err.message.includes("Failed to fetch"))
      ) {
        setIsCorsError(true);
        setError("Unable to load file due to CORS restrictions");
      } else {
        setError(errorMessage);
      }

      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsDirty(true);
    onEdit?.(newContent);
  };

  const handleSave = () => {
    if (onEdit && isDirty) {
      onEdit(content);
      setIsDirty(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent =
        content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank");
  };

  const lineCount = content.split("\n").length;

  if (loading) {
    return (
      <Container>
        <CenteredContainer>
          <IconWrapper className="spinning">
            <Loader2 />
          </IconWrapper>
          <Subtitle>Loading file...</Subtitle>
        </CenteredContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <CenteredContainer>
          <IconWrapper $color="#d93025">
            <AlertCircle />
          </IconWrapper>
          <Title>Unable to preview file</Title>
          <Subtitle>{error}</Subtitle>

          {isCorsError && (
            <CorsWarning>
              <WarningTitle>CORS Restriction</WarningTitle>
              <WarningText>
                The file storage service doesn't allow direct preview in the
                browser. You can download the file to view it locally or open it
                in a new tab.
              </WarningText>
            </CorsWarning>
          )}

          <ButtonGroup>
            <Button $primary onClick={handleOpenInNewTab}>
              <ExternalLink size={16} />
              Open in new tab
            </Button>
            {onDownload && (
              <Button onClick={onDownload}>
                <Download size={16} />
                Download file
              </Button>
            )}
          </ButtonGroup>
        </CenteredContainer>
      </Container>
    );
  }

  return (
    <Container>
      <EditorContainer>
        <LineNumbers>
          {Array.from({ length: lineCount }, (_, i) => (
            <LineNumber key={i + 1}>{i + 1}</LineNumber>
          ))}
        </LineNumbers>
        <TextArea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={!onEdit}
          spellCheck={false}
        />
      </EditorContainer>
    </Container>
  );
}
