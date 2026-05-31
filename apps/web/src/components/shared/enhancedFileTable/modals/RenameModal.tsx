import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { XIcon as X, CheckIcon as Check } from "../../icons/index";
import type { EnhancedFileItem } from "../types/fileActions";
import { T } from "../../../../theme/tokens";

interface RenameModalProps {
  isOpen: boolean;
  file: EnhancedFileItem;
  onClose: () => void;
  onRename: (fileId: string, newName: string) => Promise<void>;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const ModalOverlay = styled.div`
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
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${T.bgSurface};
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rLg};
  padding: clamp(16px, 4vw, 24px);
  width: min(400px, calc(100vw - 24px));
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: ${T.shadowElevated};
  animation: ${slideUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: ${T.fontUI};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${T.textPrimary};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: ${T.textSecondary};
  cursor: pointer;
  transition: all ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    color: ${T.textPrimary};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${T.textPrimary};
`;

const FileNameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rMd};
  font-size: 14px;
  font-family: ${T.fontUI};
  background: ${T.bgInput};
  color: ${T.textPrimary};
  transition: all ${T.tFast};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${T.accent};
    box-shadow: ${T.accentGlow};
  }

  &:disabled {
    background: ${T.bgElevated};
    color: ${T.textMuted};
    cursor: not-allowed;
  }
`;

const FileInfo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: ${T.bgElevated};
  border-radius: ${T.rMd};
  font-size: 12px;
  color: ${T.textSecondary};
`;

const FileNamePreview = styled.div`
  font-family: ${T.fontMono};
  margin-top: 4px;
  color: ${T.textPrimary};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 24px;
  border: none;
  border-radius: ${T.rMd};
  font-size: 14px;
  font-weight: 500;
  font-family: ${T.fontUI};
  cursor: pointer;
  transition: all ${T.tFast};
  display: flex;
  align-items: center;
  gap: 8px;

  ${(props) =>
    props.$primary
      ? `
    background: ${T.accent};
    color: ${T.textInvert};
    &:hover {
      background: ${T.accentHover};
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `
      : props.$danger
        ? `
    background: ${T.danger};
    color: ${T.textInvert};
  `
        : `
    background: ${T.bgHover};
    color: ${T.textPrimary};
    &:hover {
      background: ${T.bgActive};
    }
  `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  file,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState(file.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewName(file.name);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        if (file.isFolder || file.type === "folder") {
          inputRef.current?.select();
          return;
        }
        const extensionIndex = file.name.lastIndexOf(".");
        if (extensionIndex > 0) {
          inputRef.current?.setSelectionRange(0, extensionIndex);
        } else {
          inputRef.current?.select();
        }
      }, 100);
    }
  }, [isOpen, file.name]);

  if (!isOpen) return null;

  const isFolder = file.isFolder || file.type === "folder";

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (newName.trim() === file.name) {
      onClose();
      return;
    }

    if (!newName.trim()) {
      setError(isFolder ? "Folder name cannot be empty" : "File name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onRename(file.id, newName.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to rename file");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getFileExtension = () => {
    const lastDot = file.name.lastIndexOf(".");
    return lastDot > 0 ? file.name.substring(lastDot) : "";
  };

  const extension = getFileExtension();
  const nameWithoutExt = extension
    ? newName.replace(new RegExp(`${extension}$`), "")
    : newName;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>{isFolder ? "Rename folder" : "Rename file"}</ModalTitle>
            <CloseButton onClick={onClose} type="button">
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <InputLabel htmlFor="fileName">New name</InputLabel>
            <FileNameInput
              ref={inputRef}
              id="fileName"
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              autoComplete="off"
              spellCheck="false"
            />

            <FileInfo>
              <div>Current name: {file.name}</div>
              {extension && (
                <FileNamePreview>
                  {nameWithoutExt}
                  <span style={{ color: "var(--ed-accent)" }}>{extension}</span>
                </FileNamePreview>
              )}
            </FileInfo>

            {error && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  background: "#fce8e6",
                  border: "1px solid #f28b82",
                  borderRadius: "6px",
                  color: "#c5221f",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              $primary
              type="submit"
              disabled={
                isSubmitting || newName.trim() === file.name || !newName.trim()
              }
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Renaming...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Rename
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};
