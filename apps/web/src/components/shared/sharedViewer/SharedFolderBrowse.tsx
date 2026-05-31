import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import api, { getApiBaseURL } from "../../../lib/axios";
import { T } from "../../../theme/tokens";
import FileTypeIcon from "../files_table/FileTypeIcon";
import { FolderIcon as Folder } from "../icons/index";

interface SharedFolderBrowseProps {
  token: string;
  sharedRoot: string;
  folderName: string;
  ownerName: string;
  permission: "view" | "comment" | "edit" | "download";
  canDownload: boolean;
}

interface FolderContent {
  files: Array<{
    id: number;
    name: string;
    size: number;
    mimeType?: string;
  }>;
  folders: Array<{ id: number; name: string; path: string }>;
}

const SharedFolderBrowse: React.FC<SharedFolderBrowseProps> = ({
  token,
  sharedRoot,
  folderName,
  ownerName,
  permission,
  canDownload,
}) => {
  const [currentPath, setCurrentPath] = useState(sharedRoot);
  const [content, setContent] = useState<FolderContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchContent = useCallback(async (path: string) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/sharing/public/${token}/folder-contents?path=${encodeURIComponent(path)}`,
      );
      if (response.data.success) {
        setContent(response.data.content);
      }
    } catch (err) {
      console.error("Failed to load shared folder:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchContent(currentPath);
  }, [currentPath, fetchContent]);

  const rootParts = sharedRoot.split("/").filter(Boolean);
  const currentParts = currentPath.split("/").filter(Boolean);
  const relativeParts = currentParts.slice(rootParts.length);

  const navigateToRelative = (index: number) => {
    const nextRelative = relativeParts.slice(0, index + 1);
    setCurrentPath(
      [...rootParts, ...nextRelative].join("/") || sharedRoot,
    );
  };

  const handleFolderOpen = (path: string) => {
    setCurrentPath(path);
  };

  const handleFileOpen = (fileId: number, name: string) => {
    setPreviewUrl(`${getApiBaseURL()}/sharing/stream/${token}/${fileId}`);
    setPreviewName(name);
  };

  const handleDownloadFolder = async () => {
    if (!canDownload) return;
    setDownloading(true);
    try {
      const response = await api.get(`/sharing/download-folder/${token}`);
      if (response.data.success && response.data.downloadUrl) {
        const link = document.createElement("a");
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName || `${folderName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Folder download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const displayTitle =
    currentPath === sharedRoot
      ? folderName
      : currentPath.split("/").pop() || folderName;

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>{displayTitle}</Title>
          <Subtitle>Shared by {ownerName} · {permission} access</Subtitle>
          {relativeParts.length > 0 && (
            <Breadcrumbs>
              <CrumbButton type="button" onClick={() => setCurrentPath(sharedRoot)}>
                {folderName}
              </CrumbButton>
              {relativeParts.map((part, index) => (
                <React.Fragment key={`${part}-${index}`}>
                  <CrumbSep>/</CrumbSep>
                  {index === relativeParts.length - 1 ? (
                    <CrumbCurrent>{part}</CrumbCurrent>
                  ) : (
                    <CrumbButton type="button" onClick={() => navigateToRelative(index)}>
                      {part}
                    </CrumbButton>
                  )}
                </React.Fragment>
              ))}
            </Breadcrumbs>
          )}
        </HeaderLeft>
        {canDownload && (
          <DownloadButton type="button" onClick={handleDownloadFolder} disabled={downloading}>
            {downloading ? "Preparing…" : "Download folder"}
          </DownloadButton>
        )}
      </Header>

      {loading ? (
        <LoadingState>Loading folder…</LoadingState>
      ) : (
        <ContentGrid>
          {content?.folders.map((folder) => (
            <GridCard key={folder.path} onClick={() => handleFolderOpen(folder.path)}>
              <IconWrap>
                <Folder size={40} color={T.textSecondary} />
              </IconWrap>
              <CardName title={folder.name}>{folder.name}</CardName>
              <CardMeta>Folder</CardMeta>
            </GridCard>
          ))}

          {content?.files.map((file) => (
            <GridCard key={file.id} onClick={() => handleFileOpen(file.id, file.name)}>
              <IconWrap>
                <FileTypeIcon fileName={file.name} mimeType={file.mimeType} size={40} />
              </IconWrap>
              <CardName title={file.name}>{file.name}</CardName>
              <CardMeta>{formatSize(file.size)}</CardMeta>
            </GridCard>
          ))}

          {content &&
            content.files.length === 0 &&
            content.folders.length === 0 && (
              <EmptyState>This folder is empty</EmptyState>
            )}
        </ContentGrid>
      )}

      {previewUrl && previewName && (
        <PreviewOverlay onClick={() => setPreviewUrl(null)}>
          <PreviewPanel onClick={(e) => e.stopPropagation()}>
            <PreviewHeader>
              <span>{previewName}</span>
              <CloseButton type="button" onClick={() => setPreviewUrl(null)}>
                ✕
              </CloseButton>
            </PreviewHeader>
            <PreviewBody>
              {previewName.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
                <PreviewImage src={previewUrl} alt={previewName} />
              ) : previewName.match(/\.pdf$/i) ? (
                <PreviewIframe src={previewUrl} title={previewName} />
              ) : (
                <PreviewFallback>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                    Open file
                  </a>
                </PreviewFallback>
              )}
            </PreviewBody>
          </PreviewPanel>
        </PreviewOverlay>
      )}
    </Container>
  );
};

export default SharedFolderBrowse;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  min-height: 100vh;
  background: ${T.bgBase};
  font-family: ${T.fontUI};
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  color: ${T.textPrimary};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${T.textSecondary};
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 13px;
`;

const CrumbButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${T.accent};
  cursor: pointer;
`;

const CrumbSep = styled.span`
  color: ${T.textMuted};
`;

const CrumbCurrent = styled.span`
  color: ${T.textPrimary};
`;

const DownloadButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: ${T.rMd};
  background: ${T.accent};
  color: white;
  font-weight: 500;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  padding: 48px;
  text-align: center;
  color: ${T.textSecondary};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`;

const GridCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 12px;
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rLg};
  background: ${T.bgSurface};
  cursor: pointer;
  text-align: center;
  transition: background ${T.tFast}, border-color ${T.tFast};
  &:hover {
    background: ${T.bgHover};
    border-color: ${T.borderStrong};
  }
`;

const IconWrap = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardName = styled.div`
  width: 100%;
  font-size: 13px;
  font-weight: 500;
  color: ${T.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardMeta = styled.div`
  font-size: 12px;
  color: ${T.textSecondary};
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 48px;
  text-align: center;
  color: ${T.textSecondary};
`;

const PreviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`;

const PreviewPanel = styled.div`
  width: min(960px, 100%);
  max-height: 90vh;
  background: ${T.bgSurface};
  border-radius: ${T.rLg};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${T.borderSubtle};
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
`;

const PreviewBody = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
`;

const PreviewIframe = styled.iframe`
  width: 100%;
  height: 70vh;
  border: none;
`;

const PreviewFallback = styled.div`
  padding: 24px;
`;
