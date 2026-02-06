import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Download,
  File,
  AlertCircle,
  ExternalLink,
  Archive,
  Package,
} from "lucide-react";
import { type FileTypeInfo } from "../../utils/FileTypeDetector";

interface DefaultPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  fileTypeInfo: FileTypeInfo;
  headers?: Record<string, string>;
}

const DefaultPreview: React.FC<DefaultPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  fileTypeInfo,
  headers,
}) => {
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [loadingSize, setLoadingSize] = useState(true);

  useEffect(() => {
    fetchFileSize();
  }, [url]);

  const fetchFileSize = async () => {
    try {
      const response = await fetch(url, { method: "HEAD", headers });
      const size = response.headers.get("content-length");
      setFileSize(size ? parseInt(size) : null);
    } catch (err) {
      // Ignore size fetch errors
    } finally {
      setLoadingSize(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
  };

  const getFileTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      archive: "Compressed Archive",
      unsupported: "Unsupported File",
      executable: "Executable Program",
      font: "Font File",
      "3d": "3D Model",
      database: "Database File",
    };
    return descriptions[type] || "File";
  };

  const getRecommendedSoftware = (
    extension: string,
    type: string,
  ): string[] => {
    const recommendations: Record<string, string[]> = {
      zip: ["WinZip", "7-Zip", "WinRAR", "The Unarchiver"],
      rar: ["WinRAR", "7-Zip", "The Unarchiver"],
      "7z": ["7-Zip", "WinZip", "The Unarchiver"],
      tar: ["7-Zip", "WinZip", "The Unarchiver"],
      gz: ["7-Zip", "WinZip", "The Unarchiver"],
      ppt: ["Microsoft PowerPoint", "Google Slides", "LibreOffice Impress"],
      pptx: ["Microsoft PowerPoint", "Google Slides", "LibreOffice Impress"],
      heic: ["Photos", "Preview (macOS)", "Third-party converters"],
      heif: ["Photos", "Preview (macOS)", "Third-party converters"],
      exe: ["Windows", "Wine (Linux/macOS)"],
      dmg: ["macOS"],
      deb: ["Ubuntu/Debian", "dpkg"],
      rpm: ["Fedora/RHEL", "rpm"],
      apk: ["Android"],
      iso: ["Virtual Machine", "Burn to disc"],
    };

    if (recommendations[extension]) {
      return recommendations[extension];
    }

    if (type === "archive") {
      return ["7-Zip", "WinZip", "WinRAR", "The Unarchiver"];
    }

    return ["Appropriate software for this file type"];
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank");
  };

  const getFileIcon = () => {
    switch (fileTypeInfo.type) {
      case "archive":
        return <Archive size={64} />;
      case "executable":
        return <Package size={64} />;
      default:
        return <File size={64} />;
    }
  };

  return (
    <Container>
      <Content>
        <FileIcon>{getFileIcon()}</FileIcon>

        <FileName>{fileName}</FileName>

        <FileDetails>
          <DetailItem>
            <strong>Type:</strong> {getFileTypeDescription(fileTypeInfo.type)}
          </DetailItem>
          <DetailItem>
            <strong>Extension:</strong> .{fileTypeInfo.extension.toUpperCase()}
          </DetailItem>
          {fileSize && (
            <DetailItem>
              <strong>Size:</strong> {formatFileSize(fileSize)}
            </DetailItem>
          )}
        </FileDetails>

        <WarningMessage>
          <AlertCircle size={20} />
          <span>This file type cannot be previewed in the browser</span>
        </WarningMessage>

        <Recommendations>
          <RecommendationTitle>Recommended Software:</RecommendationTitle>
          <SoftwareList>
            {getRecommendedSoftware(
              fileTypeInfo.extension,
              fileTypeInfo.type,
            ).map((software, index) => (
              <SoftwareItem key={index}>{software}</SoftwareItem>
            ))}
          </SoftwareList>
        </Recommendations>

        <ActionButtons>
          <ActionButton onClick={handleOpenInNewTab}>
            <ExternalLink size={16} />
            Open in New Tab
          </ActionButton>

          {onDownload && (
            <ActionButton $primary onClick={onDownload}>
              <Download size={16} />
              Download File
            </ActionButton>
          )}
        </ActionButtons>

        <AdditionalInfo>
          <p>
            To view this file, you'll need to download it and open it with
            appropriate software. Some file types may require specific
            applications or operating systems.
          </p>
          {fileTypeInfo.type === "archive" && (
            <p>
              <strong>Note:</strong> This is a compressed archive. Extract its
              contents using archiving software.
            </p>
          )}
          {fileTypeInfo.type === "executable" && (
            <p>
              <strong>Warning:</strong> Only run executable files from trusted
              sources.
            </p>
          )}
        </AdditionalInfo>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
`;

const Content = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const FileIcon = styled.div`
  color: #764ba2;
  margin-bottom: 20px;
`;

const FileName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 16px;
  word-break: break-word;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
`;

const DetailItem = styled.div`
  strong {
    color: #202124;
    margin-right: 8px;
  }

  color: #5f6368;
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
`;

const Recommendations = styled.div`
  margin-bottom: 24px;
  text-align: left;
`;

const RecommendationTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 8px;
`;

const SoftwareList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SoftwareItem = styled.li`
  padding: 8px 12px;
  background: #e8f0fe;
  border-left: 3px solid #1a73e8;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 13px;
  color: #1a73e8;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;

  ${({ $primary }) =>
    $primary
      ? `
    background: #1a73e8;
    color: white;
    
    &:hover {
      background: #0d62d9;
      transform: translateY(-1px);
    }
  `
      : `
    background: #f8f9fa;
    color: #202124;
    border: 1px solid #dadce0;
    
    &:hover {
      background: #f1f3f4;
      transform: translateY(-1px);
    }
  `}
`;

const AdditionalInfo = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #5f6368;
  text-align: left;
  line-height: 1.5;

  p {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: #202124;
  }
`;

export default DefaultPreview;
