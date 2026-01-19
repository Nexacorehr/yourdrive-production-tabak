import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Lock, AlertCircle, Download } from "lucide-react";
import { useParams } from "@tanstack/react-router";

interface SharedFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  permission: string;
  ownerName: string;
  hasPassword: boolean;
  expiresAt: string | null;
  maxDownloads: number | null;
  downloadCount: number;
}

const SharedViewer: React.FC = () => {
  const params = useParams({ strict: false });
  const token = params.token as string;
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [contentLoading, setContentLoading] = useState(false);

  const getFileExtension = (fileName: string): string => {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const fetchShareInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sharing/public/${token}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to load shared file");
        setLoading(false);
        return;
      }

      setFile(data.share);
      setPasswordRequired(data.share.hasPassword);

      if (!data.share.hasPassword) {
        await handleAccess("");
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching share info:", err);
      setError("Failed to load shared file");
      setLoading(false);
    }
  };

  const handleAccess = async (pwd: string) => {
    setAuthenticating(true);
    setError(null);

    try {
      const response = await fetch(`/api/sharing/access/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ password: pwd || password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to access file");
        setAuthenticating(false);
        return;
      }

      if (data.signedUrl) {
        setFileUrl(data.signedUrl);
        setPasswordRequired(false);
        setLoading(false);
      } else {
        setError("No file URL provided");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error accessing file:", err);
      setError("Failed to access file");
      setAuthenticating(false);
    } finally {
      setAuthenticating(false);
    }
  };

  const loadFileContent = async () => {
    if (!fileUrl || !file) return;

    const mimeType = file.mimeType.toLowerCase();
    const extension = getFileExtension(file.fileName);

    // Text-based files that need to be loaded
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript" ||
      [
        "txt",
        "md",
        "json",
        "xml",
        "csv",
        "log",
        "js",
        "jsx",
        "ts",
        "tsx",
        "py",
        "java",
        "c",
        "cpp",
        "h",
        "css",
        "html",
        "sql",
      ].includes(extension)
    ) {
      setContentLoading(true);
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(arrayBuffer);
        setFileContent(text);
      } catch (err) {
        console.error("Failed to load file content:", err);
      } finally {
        setContentLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file?.fileName || "download";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderPreview = () => {
    if (!fileUrl || !file) return null;

    const mimeType = file.mimeType.toLowerCase();
    const extension = getFileExtension(file.fileName);

    // Images
    if (mimeType.startsWith("image/")) {
      return (
        <ImageContainer>
          <PreviewImage src={fileUrl} alt={file.fileName} />
        </ImageContainer>
      );
    }

    // PDFs
    if (mimeType === "application/pdf") {
      return (
        <IframeContainer>
          <PreviewIframe src={`${fileUrl}#view=FitH`} title={file.fileName} />
        </IframeContainer>
      );
    }

    // Videos
    if (mimeType.startsWith("video/")) {
      return (
        <VideoContainer>
          <PreviewVideo controls>
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the video tag.
          </PreviewVideo>
        </VideoContainer>
      );
    }

    // Audio
    if (mimeType.startsWith("audio/")) {
      return (
        <AudioContainer>
          <PreviewAudio controls>
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the audio tag.
          </PreviewAudio>
        </AudioContainer>
      );
    }

    // Text-based files
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript" ||
      [
        "txt",
        "md",
        "json",
        "xml",
        "csv",
        "log",
        "js",
        "jsx",
        "ts",
        "tsx",
        "py",
        "java",
        "c",
        "cpp",
        "h",
        "css",
        "html",
        "sql",
      ].includes(extension)
    ) {
      if (contentLoading) {
        return (
          <CenteredContainer>
            <LoadingSpinner />
            <LoadingText>Loading content...</LoadingText>
          </CenteredContainer>
        );
      }

      if (!fileContent) {
        return (
          <CenteredContainer>
            <LoadingSpinner />
            <LoadingText>Waiting for content...</LoadingText>
          </CenteredContainer>
        );
      }

      const lines = fileContent.split("\n");

      return (
        <TextViewerContainer>
          <TextViewerContent>
            {lines.map((line, index) => (
              <TextLine key={index}>
                <LineNumberCell>{index + 1}</LineNumberCell>
                <LineContentCell>{line || "\u00A0"}</LineContentCell>
              </TextLine>
            ))}
          </TextViewerContent>
        </TextViewerContainer>
      );
    }

    // Office documents via Google Viewer
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        fileUrl,
      )}&embedded=true`;
      return (
        <IframeContainer>
          <PreviewIframe src={viewerUrl} title={file.fileName} />
        </IframeContainer>
      );
    }

    // Unsupported file type
    return (
      <CenteredContainer>
        <UnsupportedIcon>📄</UnsupportedIcon>
        <UnsupportedTitle>Preview not available</UnsupportedTitle>
        <UnsupportedText>
          This file type cannot be previewed in the browser
        </UnsupportedText>
        {file.permission === "download" && (
          <DownloadButton onClick={handleDownload}>
            <Download size={18} />
            Download to view
          </DownloadButton>
        )}
      </CenteredContainer>
    );
  };

  useEffect(() => {
    if (token) {
      fetchShareInfo();
    }
  }, [token]);

  useEffect(() => {
    if (fileUrl && file) {
      loadFileContent();
    }
  }, [fileUrl]);

  if (loading) {
    return (
      <Container>
        <CenteredContainer>
          <LoadingSpinner />
          <LoadingText>Loading shared file...</LoadingText>
        </CenteredContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <CenteredContainer>
          <AlertCircle size={64} color="#d93025" />
          <ErrorTitle>Cannot access file</ErrorTitle>
          <ErrorText>{error}</ErrorText>
        </CenteredContainer>
      </Container>
    );
  }

  if (passwordRequired) {
    return (
      <Container>
        <PasswordContainer>
          <Lock size={48} color="#1a73e8" />
          <PasswordTitle>This file is password protected</PasswordTitle>
          <PasswordSubtitle>
            Enter the password to view "{file?.fileName}"
          </PasswordSubtitle>

          <PasswordForm
            onSubmit={(e) => {
              e.preventDefault();
              handleAccess(password);
            }}
          >
            <PasswordInput
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <SubmitButton type="submit" disabled={!password || authenticating}>
              {authenticating ? "Verifying..." : "Access File"}
            </SubmitButton>
          </PasswordForm>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </PasswordContainer>
      </Container>
    );
  }

  if (fileUrl && file) {
    return (
      <PreviewOverlay>
        <PreviewContainer>
          <PreviewHeader>
            <HeaderLeft>
              <FileName>{file.fileName}</FileName>
              <FileInfo>
                {formatFileSize(file.fileSize)} · Shared by {file.ownerName}
              </FileInfo>
            </HeaderLeft>

            <HeaderRight>
              {file.permission === "download" && (
                <HeaderButton onClick={handleDownload} title="Download">
                  <Download size={20} />
                </HeaderButton>
              )}
            </HeaderRight>
          </PreviewHeader>

          <PreviewContent>{renderPreview()}</PreviewContent>

          {file.expiresAt && (
            <ExpirationNotice>
              This link expires on{" "}
              {new Date(file.expiresAt).toLocaleDateString()}
            </ExpirationNotice>
          )}

          {file.maxDownloads && (
            <DownloadNotice>
              {file.downloadCount} / {file.maxDownloads} downloads used
            </DownloadNotice>
          )}
        </PreviewContainer>
      </PreviewOverlay>
    );
  }

  return null;
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  background: #ffffff;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #5f6368;
  font-weight: 500;
`;

const ErrorTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #202124;
`;

const ErrorText = styled.div`
  font-size: 16px;
  color: #5f6368;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fce8e6;
  border: 1px solid #d93025;
  border-radius: 8px;
  color: #d93025;
  font-size: 14px;
  width: 100%;
`;

const PasswordContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const PasswordTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #202124;
  margin: 0;
  text-align: center;
`;

const PasswordSubtitle = styled.div`
  font-size: 14px;
  color: #5f6368;
  text-align: center;
`;

const PasswordForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  color: #202124;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const SubmitButton = styled.button`
  padding: 14px 24px;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #1557b0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PreviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

const FileName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileInfo = styled.div`
  font-size: 13px;
  color: #5f6368;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
`;

const HeaderButton = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: all 0.2s;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }

  &:active {
    background: #e8eaed;
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #ffffff;

  pre {
    color: black !important;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #ffffff;
`;

const PreviewIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const VideoContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
`;

const PreviewVideo = styled.video`
  max-width: 100%;
  max-height: 100%;
`;

const AudioContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`;

const PreviewAudio = styled.audio`
  width: 90%;
  max-width: 600px;
`;

const TextViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #ffffff;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
`;

const TextViewerContent = styled.div`
  display: table;
  width: 100%;
  border-collapse: collapse;
`;

const TextLine = styled.div`
  display: table-row;

  &:hover {
    background: #f8f9fa;
  }
`;

const LineNumberCell = styled.div`
  display: table-cell;
  padding: 4px 16px;
  text-align: right;
  color: #80868b;
  background: #f8f9fa;
  border-right: 1px solid #e8eaed;
  user-select: none;
  vertical-align: top;
  width: 60px;
  min-width: 60px;
`;

const LineContentCell = styled.div`
  display: table-cell;
  padding: 4px 24px;
  color: #202124 !important;
  background: #ffffff !important;
  white-space: pre-wrap;
  word-break: break-all;
  vertical-align: top;

  * {
    color: #202124 !important;
  }
`;

const UnsupportedIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const UnsupportedTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 8px;
`;

const UnsupportedText = styled.div`
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 16px;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #1557b0;
  }
`;

const ExpirationNotice = styled.div`
  padding: 12px 24px;
  background: #fff3cd;
  border-top: 1px solid #ffc107;
  font-size: 13px;
  color: #856404;
  text-align: center;
  flex-shrink: 0;
`;

const DownloadNotice = styled.div`
  padding: 12px 24px;
  background: #e8f0fe;
  border-top: 1px solid #1a73e8;
  font-size: 13px;
  color: #1557b0;
  text-align: center;
  flex-shrink: 0;
`;

export default SharedViewer;
