import {
  Header as StyledHeader,
  LeftSection,
  FileName,
  FileCounter,
  ActionBar,
  NavButton,
  ActionButton,
  MoreButton,
  CloseButton,
  Divider,
} from "../styles/filePreview.styles";

export interface HeaderProps {
  fileId?: string;
  url?: string;
  fileName: string;
  mimeType?: string;
  fileType?: string;
  files: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  currentIndex: number;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onNavigate?: (index: number) => void;
  handleFavorite?: () => void;
  isFavorited?: boolean;
  handleDownload?: () => void;
  setShowInfo: (show: boolean) => void;
  showInfo?: boolean;
}

export const Header = ({
  fileName,
  files,
  currentIndex,
  onNavigate,
  onRename,
  onShare,
  onClose,
  handleFavorite,
  isFavorited,
  handleDownload,
  setShowInfo,
  showInfo,
}: HeaderProps) => {
  return (
    <StyledHeader>
      <LeftSection>
        <FileName>{fileName}</FileName>
        {files.length > 1 && (
          <FileCounter>
            {currentIndex + 1} / {files.length}
          </FileCounter>
        )}
      </LeftSection>

      <ActionBar>
        {files.length > 1 && (
          <>
            <NavButton
              onClick={() => onNavigate && onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              title="Previous file (Left arrow)"
            >
              ←
            </NavButton>
            <NavButton
              onClick={() => onNavigate && onNavigate(currentIndex + 1)}
              disabled={currentIndex === files.length - 1}
              title="Next file (Right arrow)"
            >
              →
            </NavButton>
            <Divider />
          </>
        )}

        <ActionButton onClick={handleFavorite} title="Favorite">
          {isFavorited ? "★" : "☆"}
        </ActionButton>

        {onRename && (
          <ActionButton onClick={onRename} title="Rename">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="currentColor"
              />
            </svg>
          </ActionButton>
        )}

        {onShare && (
          <ActionButton onClick={onShare} title="Share">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
                fill="currentColor"
              />
            </svg>
          </ActionButton>
        )}

        <ActionButton onClick={handleDownload} title="Download">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
              fill="currentColor"
            />
          </svg>
        </ActionButton>

        <ActionButton
          onClick={() => setShowInfo(!showInfo)}
          title="Information"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              fill="currentColor"
            />
          </svg>
        </ActionButton>

        <MoreButton title="More actions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
              fill="currentColor"
            />
          </svg>
        </MoreButton>

        <Divider />

        <CloseButton onClick={onClose} title="Close (Esc)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </CloseButton>
      </ActionBar>
    </StyledHeader>
  );
};
