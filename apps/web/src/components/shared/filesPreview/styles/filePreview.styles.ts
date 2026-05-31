import styled from "styled-components";
import { T } from "../../../../theme/tokens";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${T.bgOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${T.zModal};
`;

const Container = styled.div`
  width: 95vw;
  height: 95vh;
  background: ${T.bgElevated};
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rLg};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${T.shadowElevated};
  font-family: ${T.fontUI};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: ${T.bgSurface};
  border-bottom: 1px solid ${T.borderFaint};
  flex-shrink: 0;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileName = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: ${T.textPrimary};
`;

const FileCounter = styled.span`
  font-size: 14px;
  color: ${T.textSecondary};
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  background: transparent;
  border: none;
  color: ${T.textSecondary};
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${T.tBase};

  &:hover:not(:disabled) {
    background: ${T.bgHover};
    color: ${T.textPrimary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${T.textSecondary};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${T.tBase};

  &:hover {
    background: ${T.bgHover};
    color: ${T.accent};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MoreButton = styled(ActionButton)``;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${T.textSecondary};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f1f3f4;
    color: #202124;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoSidebar = styled.div`
  width: 320px;
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #dadce0;
    border-radius: 4px;
  }
`;

const InfoSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const InfoTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #202124;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const InfoLabel = styled.span`
  font-size: 13px;
  color: #5f6368;
`;

const InfoValue = styled.span`
  font-size: 13px;
  color: #202124;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  background: #e8f0fe;
  color: #1a73e8;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const ViewerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ViewerAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const ViewerAvatarPlaceholder = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1a73e8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const ViewerName = styled.span`
  font-size: 13px;
  color: #202124;
`;

const CommentItem = styled.div`
  margin-bottom: 12px;
`;

const CommentUser = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 4px;
`;

const CommentText = styled.div`
  font-size: 13px;
  color: #5f6368;
  margin-bottom: 4px;
`;

const CommentTime = styled.div`
  font-size: 11px;
  color: #80868b;
`;

const ActivityItem = styled.div`
  margin-bottom: 8px;
`;

const ActivityText = styled.div`
  font-size: 13px;
  color: #202124;
`;

const ActivityTime = styled.div`
  font-size: 11px;
  color: #80868b;
`;

const RelatedFileItem = styled.div`
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f1f3f4;
  }
`;

const RelatedFileName = styled.span`
  font-size: 13px;
  color: #1a73e8;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
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
  font-size: 14px;
  color: #5f6368;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #d93025;
  text-align: center;
`;

const RetryButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

export {
  Overlay,
  Container,
  Header,
  LeftSection,
  FileName,
  FileCounter,
  ActionBar,
  NavButton,
  ActionButton,
  MoreButton,
  CloseButton,
  Divider,
  ContentWrapper,
  PreviewContent,
  InfoSidebar,
  InfoSection,
  InfoTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
  TagsContainer,
  Tag,
  ViewerRow,
  ViewerAvatar,
  ViewerAvatarPlaceholder,
  ViewerName,
  CommentItem,
  CommentUser,
  CommentText,
  CommentTime,
  ActivityItem,
  ActivityText,
  ActivityTime,
  RelatedFileItem,
  RelatedFileName,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ErrorContainer,
  ErrorIcon,
  ErrorText,
  RetryButton,
};
