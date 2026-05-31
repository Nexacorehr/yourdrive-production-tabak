import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { XIcon as X, FolderIcon as Folder } from "../icons/index";
import { joinFolderPath } from "../../../lib/folderNavigation";
import api from "../../../lib/axios";
import { T } from "../../../theme/tokens";

interface CreateFolderModalProps {
  isOpen: boolean;
  parentPath: string;
  onClose: () => void;
  onCreated: () => void;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  parentPath,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a folder name");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const folderPath = joinFolderPath(parentPath, trimmed);
      await api.post("/files/folders/create", { folderPath });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to create folder";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <Header>
          <TitleRow>
            <Folder size={20} color="var(--ed-accent)" />
            <Title>New folder</Title>
          </TitleRow>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </CloseBtn>
        </Header>
        <Body>
          <Hint>
            {parentPath
              ? `Inside ${parentPath.replace(/\//g, " / ")}`
              : "At the top level of Your Files"}
          </Hint>
          <Label htmlFor="folder-name">Folder name</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Projects"
            autoFocus
            disabled={submitting}
          />
          {error && <ErrorText>{error}</ErrorText>}
        </Body>
        <Footer>
          <Secondary type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Secondary>
          <Primary type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create folder"}
          </Primary>
        </Footer>
      </Dialog>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${T.bgOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${T.zModal};
  animation: ${fadeIn} 0.15s ease-out;
`;

const Dialog = styled.form`
  width: min(420px, calc(100vw - 32px));
  background: ${T.bgSurface};
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rLg};
  box-shadow: ${T.shadowElevated};
  animation: ${slideUp} 0.2s ease-out;
  font-family: ${T.fontUI};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 8px;
  border-bottom: 1px solid ${T.borderFaint};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${T.textPrimary};
`;

const CloseBtn = styled.button`
  border: none;
  background: transparent;
  color: ${T.textSecondary};
  cursor: pointer;
  padding: 6px;
  border-radius: ${T.rFull};
  transition: background ${T.tFast};
  &:hover {
    background: ${T.bgHover};
  }
`;

const Body = styled.div`
  padding: 16px 20px;
`;

const Hint = styled.p`
  margin: 0 0 14px;
  font-size: 13px;
  color: ${T.textSecondary};
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${T.textPrimary};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rMd};
  font-size: 14px;
  font-family: ${T.fontUI};
  background: ${T.bgInput};
  color: ${T.textPrimary};
  transition: border-color ${T.tFast}, box-shadow ${T.tFast};
  &:focus {
    outline: none;
    border-color: ${T.accent};
    box-shadow: ${T.accentGlow};
  }
`;

const ErrorText = styled.p`
  margin: 10px 0 0;
  font-size: 13px;
  color: ${T.dangerText};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px 20px;
  border-top: 1px solid ${T.borderFaint};
`;

const Secondary = styled.button`
  padding: 9px 16px;
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rMd};
  background: ${T.bgHover};
  color: ${T.textPrimary};
  font-weight: 500;
  font-family: ${T.fontUI};
  cursor: pointer;
  transition: background ${T.tFast};
  &:hover:not(:disabled) {
    background: ${T.bgActive};
  }
`;

const Primary = styled.button`
  padding: 9px 18px;
  border: none;
  border-radius: ${T.rMd};
  background: ${T.accent};
  color: ${T.textInvert};
  font-weight: 600;
  font-family: ${T.fontUI};
  cursor: pointer;
  transition: background ${T.tFast};
  &:hover:not(:disabled) {
    background: ${T.accentHover};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default CreateFolderModal;
