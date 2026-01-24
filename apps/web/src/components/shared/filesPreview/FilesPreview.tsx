import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Overlay,
  Container,
  ContentWrapper,
} from "./styles/filePreview.styles";

import { Header } from "./components/Header";
import PreviewRenderer from "./components/Preview";
import { InfoSidebar } from "./components/InfoSidebar";
import SharePopup from "../popups/share/SharePopup";

import { useFileLoader } from "../hooks/useFileLoader";
import { usePopupStore } from "../popups/popup.store";
import { useAuthStore } from "../../../store/authStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface FilePreviewProps {
  fileId?: string;
  url?: string;
  fileName: string;
  mimeType?: string;
  fileType?: string;
  onClose: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  allFiles?: Array<{
    id: string;
    name: string;
    type?: string;
    mimeType?: string;
    url?: string;
  }>;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  ownerName?: string;
  files?: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  metadata?: Record<string, any>;
  comments?: Array<{ user: string; text: string; timestamp: string }>;
  activityLog?: Array<{ action: string; user: string; timestamp: string }>;
  relatedFiles?: Array<{ name: string; url: string }>;
  tags?: string[];
  viewers?: Array<{ name: string; avatar?: string }>;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  fileId,
  url: propUrl,
  fileName,
  mimeType,
  fileType,
  onClose,
  onEdit,
  onDownload,
  onRename,
  onDelete,
  onFavorite,
  allFiles = [],
  currentIndex = -1,
  onNavigate,
  ownerName,
  files = [],
  metadata,
  comments = [],
  activityLog = [],
  relatedFiles = [],
  tags = [],
  viewers = [],
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  const toggleSharingPopup = usePopupStore((state) => state.toggleSharingPopup);
  const isSharingPopupOpen = usePopupStore((state) => state.isSharingPopupOpen);

  const hasNavigation = allFiles.length > 1 && currentIndex >= 0 && onNavigate;
  const hasPrevious = hasNavigation && currentIndex > 0;
  const hasNext = hasNavigation && currentIndex < allFiles.length - 1;

  const { fileUrl, detectedType, loading, error } = useFileLoader({
    fileId,
    propUrl,
    fileName,
    mimeType,
    fileType,
  });

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  const commonProps = {
    url: fileUrl,
    fileName,
    fileType: detectedType,
    fileId,
    onClose,
    onEdit,
    onDownload: handleDownload,
    onShare: toggleSharingPopup,
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const checkIfFavorited = async () => {
    if (!fileId) return;

    try {
      const response = await fetch(`/api/files/favorites/check-favorites`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();
      if (data.success) setIsFavorited(data.favorites.includes(fileId));

      console.log("Favorite check data:", data);
    } catch (err) {
      console.error("Error checking favorite:", err);
    }
  };

  const handleFavorite = async () => {
    if (!fileId) return;

    try {
      const response = await fetch(`/api/files/favorites/${fileId}/favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();
      if (data.success) setIsFavorited(data.favorited);

      console.log("Toggle favorite data:", data);
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (hasNavigation && e.key === "ArrowLeft" && hasPrevious) {
        onNavigate(currentIndex - 1);
      } else if (hasNavigation && e.key === "ArrowRight" && hasNext) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, hasNavigation, hasPrevious, hasNext, currentIndex, onNavigate]);

  useEffect(() => {
    if (fileId && accessToken) {
      checkIfFavorited();
    }
  }, [fileId, accessToken]);

  return (
    <Overlay onClick={handleBackdropClick}>
      <Container>
        <Header
          fileName={fileName}
          ownerName={ownerName}
          files={allFiles.length > 0 ? allFiles : files}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          onNavigate={onNavigate}
          onRename={onRename}
          onClose={onClose}
          handleShare={toggleSharingPopup}
          handleFavorite={handleFavorite}
          isFavorited={isFavorited}
          handleDownload={handleDownload}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
        />

        <ContentWrapper>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading file...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorText>{error}</ErrorText>
              <ErrorSubtext>Please try again or contact support</ErrorSubtext>
            </ErrorContainer>
          ) : (
            <PreviewRenderer
              type={detectedType}
              common={commonProps}
              files={allFiles.length > 0 ? allFiles : files}
              index={currentIndex >= 0 ? currentIndex : 0}
              onNavigate={onNavigate}
            />
          )}

          <InfoSidebar
            show={showInfo}
            mimeType={mimeType}
            fileType={fileType}
            detectedType={detectedType}
            metadata={metadata}
            tags={tags}
            viewers={viewers}
            comments={comments}
            activityLog={activityLog}
            relatedFiles={relatedFiles}
          />
        </ContentWrapper>

        {hasPrevious && (
          <NavButton $position="left" onClick={handlePrevious}>
            <ChevronLeft size={32} />
          </NavButton>
        )}

        {hasNext && (
          <NavButton $position="right" onClick={handleNext}>
            <ChevronRight size={32} />
          </NavButton>
        )}
      </Container>
      {isSharingPopupOpen && fileId && (
        <SharePopup
          fileId={fileId}
          fileName={fileName}
          onClose={toggleSharingPopup}
        />
      )}
    </Overlay>
  );
};

const NavButton = styled.button<{ $position: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ $position }) => ($position === "left" ? "left: 24px;" : "right: 24px;")}
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #202124;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 10;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;

  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #f8f9fa;
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

const ErrorContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 40px;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 8px;
`;

const ErrorText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #d93025;
  text-align: center;
  max-width: 500px;
`;

const ErrorSubtext = styled.div`
  font-size: 14px;
  color: #5f6368;
  text-align: center;
`;

export default FilePreview;
