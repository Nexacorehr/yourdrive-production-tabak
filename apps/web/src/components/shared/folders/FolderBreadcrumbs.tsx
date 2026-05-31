import React from "react";
import styled from "styled-components";
import {
  ChevronRightIcon as ChevronRight,
  HomeIcon as Home,
  NewFolderIcon as FolderPlus,
} from "../icons/index";
import { buildBreadcrumbSegments } from "../../../lib/folderNavigation";
import { T } from "../../../theme/tokens";

interface FolderBreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCreateFolder?: () => void;
  createDisabled?: boolean;
}

export const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({
  currentPath,
  onNavigate,
  onCreateFolder,
  createDisabled,
}) => {
  const segments = buildBreadcrumbSegments(currentPath);

  return (
    <Bar>
      <Trail>
        <Crumb type="button" $active={!currentPath} onClick={() => onNavigate("")}>
          <Home size={15} />
          <span>Your Files</span>
        </Crumb>
        {segments.map((segment) => (
          <React.Fragment key={segment.path}>
            <ChevronRight size={14} color="var(--ed-textMuted)" />
            <Crumb
              type="button"
              $active={segment.path === currentPath}
              onClick={() => onNavigate(segment.path)}
            >
              {segment.label}
            </Crumb>
          </React.Fragment>
        ))}
      </Trail>
      {onCreateFolder && (
        <NewFolderBtn
          type="button"
          onClick={onCreateFolder}
          disabled={createDisabled}
        >
          <FolderPlus size={16} />
          New folder
        </NewFolderBtn>
      )}
    </Bar>
  );
};

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: ${T.rMd};
  background: ${T.bgSurface};
  border: 1px solid ${T.borderFaint};
  box-shadow: ${T.shadowSm};
`;

const Trail = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
`;

const Crumb = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: ${(p) => (p.$active ? T.accentFaint : "transparent")};
  color: ${(p) => (p.$active ? T.accent : T.textSecondary)};
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  font-family: ${T.fontUI};
  padding: 6px 10px;
  border-radius: ${T.rMd};
  cursor: pointer;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background ${T.tFast}, color ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    color: ${T.textPrimary};
  }
`;

const NewFolderBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${T.borderAccent};
  background: ${T.accentFaint};
  color: ${T.accent};
  font-size: 13px;
  font-weight: 600;
  font-family: ${T.fontUI};
  padding: 8px 12px;
  border-radius: ${T.rMd};
  cursor: pointer;
  white-space: nowrap;
  transition: background ${T.tFast};

  &:hover:not(:disabled) {
    background: ${T.bgActive};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export default FolderBreadcrumbs;
