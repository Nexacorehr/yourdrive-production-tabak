import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../../store/authStore";
import FilesTable, {
  type FileItem,
} from "../../../../shared/files_table/FilesTable";
import { useFileSearch } from "../../../../shared/hooks/useFileSearch";
import FilePreview from "../../../../shared/filesPreview/FilesPreview";

import { FILES_REFRESH_EVENT } from "../../../../../events/fileEvents";
import { useEvent } from "../../../../../events/useEvent";

interface ApiFile {
  id: string;
  original_name: string;
  s3_key: string;
  folder_path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

const getEmptyMessage = (hasActiveFilters: boolean): string => {
  if (hasActiveFilters) {
    return "No files match your filters";
  }
  return "No recent files";
};

const getEmptySubtext = (hasActiveFilters: boolean): string => {
  if (hasActiveFilters) {
    return "Try adjusting your search or filter criteria";
  }
  return "Files you upload or interact with will appear here";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }
};

const RecentFiles: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const { filteredFiles, hasActiveFilters, activeFilterCount } =
    useFileSearch(files);

  const navigableFiles =
    selectedFiles.size > 0
      ? filteredFiles.filter((f) => selectedFiles.has(f.id))
      : filteredFiles;

  const previewFile = previewIndex >= 0 ? navigableFiles[previewIndex] : null;

  const handleFilePreview = (file: FileItem) => {
    const index = navigableFiles.findIndex((f) => f.id === file.id);
    setPreviewIndex(index);
  };

  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < navigableFiles.length) {
      setPreviewIndex(newIndex);
    }
  };

  const handleClosePreview = () => {
    setPreviewIndex(-1);
  };

  const handleFileSelect = (file: FileItem, selected: boolean) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(file.id);
      } else {
        newSet.delete(file.id);
      }
      return newSet;
    });
  };

  const handleFileContextMenu = (file: FileItem, event: React.MouseEvent) => {
    console.log(
      "Context menu for:",
      file.name,
      "at",
      event.clientX,
      event.clientY,
    );
  };

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/files?limit=10&sort=recent", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();

      if (data.success) {
        const transformedFiles: FileItem[] = data.files.map(
          (file: ApiFile) => ({
            id: file.id,
            name: file.original_name,
            type: "file" as const,
            mimeType: file.mime_type,
            lastInteraction: formatDate(file.created_at),
            lastInteractionType: "uploaded" as const,
            location: file.folder_path || "Your Files",
            owner: {
              name: user?.name || user?.email || "You",
              isYou: true,
            },
            size: file.size,
            url: file.s3_key,
          }),
        );
        setFiles(transformedFiles);
      }
    } catch (err) {
      console.error("Error fetching recent files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchRecentFiles();
    }
  }, [accessToken, user]);

  useEvent(FILES_REFRESH_EVENT, () => {
    fetchRecentFiles();
  });

  return (
    <Container>
      {hasActiveFilters && (
        <FilterIndicator>
          Showing {filteredFiles.length} of {files.length} files
          {activeFilterCount > 0 &&
            ` (${activeFilterCount} filter${
              activeFilterCount > 1 ? "s" : ""
            } active)`}
        </FilterIndicator>
      )}
      <FilesTable
        files={filteredFiles}
        loading={loading}
        emptyMessage={getEmptyMessage(hasActiveFilters)}
        emptySubtext={getEmptySubtext(hasActiveFilters)}
        onFilePreview={handleFilePreview}
        onFileSelect={handleFileSelect}
        onFileContextMenu={handleFileContextMenu}
        selectedFiles={selectedFiles}
        showOwner={true}
        showLocation={true}
        singleClickMode="preview"
        maxHeight={650}
      />
      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={handleClosePreview}
          allFiles={navigableFiles}
          currentIndex={previewIndex}
          onNavigate={handleNavigate}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  margin-top: 24px;
`;

const FilterIndicator = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
`;

export default RecentFiles;
