import React, { useEffect, useState } from "react";
import styled from "styled-components";
import EnhancedFilesTable from "../../../shared/enhancedFileTable/EnhancedFilesTable";
import FilePreview from "../../../shared/filesPreview/FilesPreview";
import { useAuthStore } from "../../../../store/authStore";
import axios from "axios";
import toast from "react-hot-toast";

const RecycleBin: React.FC = () => {
  const token = useAuthStore((s) => s.accessToken);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  const fetchRecycleBin = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/files/recycle-bin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched recycle bin files:", res.data.files);
      setFiles(res.data.files || []);
    } catch (err) {
      console.error("Failed to fetch recycle bin:", err);
      toast.error("Failed to load recycle bin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRecycleBin();
  }, [token]);

  const handlePreview = (file: any) => {
    setPreviewFile({
      id: file.file_id,
      name: file.original_name,
      mimeType: file.mime_type,
    });
  };

  const handleRestore = async (fileId: string) => {
    try {
      const response = await axios.post(
        `/api/files/recycle-bin/restore/${fileId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("Restore response:", response.data);

      if (response.data.success) {
        toast.success("File restored successfully");
        await fetchRecycleBin();
      } else {
        toast.error(response.data.error || "Failed to restore file");
      }
    } catch (err: any) {
      console.error("Restore failed:", err);
      toast.error(err?.response?.data?.error || "Failed to restore file");
    }
  };

  const handlePermanentDelete = async (fileId: string) => {
    console.log("Permanently deleting file with ID:", fileId);
    try {
      const response = await axios.post(
        `/api/files/recycle-bin/delete/${fileId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("File permanently deleted");
        await fetchRecycleBin();
      } else {
        toast.error("Failed to delete file");
      }
    } catch (err: any) {
      console.error("Permanent delete failed:", err);
      toast.error(err?.response?.data?.error || "Failed to delete file");
    }
  };

  return (
    <Container>
      <Header>
        <Title>Recycle Bin</Title>
        {files.length > 0 && (
          <FileCount>
            {files.length} {files.length === 1 ? "file" : "files"}
          </FileCount>
        )}
      </Header>

      <EnhancedFilesTable
        files={files.map((f) => ({
          id: f.file_id,
          name: f.original_name,
          size: f.size,
          mimeType: f.mime_type,
          location: f.folder_path || "Root",
        }))}
        loading={loading}
        showOwner={false}
        showLocation={true}
        isRecycleBin={true}
        onRestoreFile={handleRestore}
        onDeletePermanently={handlePermanentDelete}
        onFilePreview={handlePreview}
        emptyMessage="Recycle Bin is empty"
        emptySubtext="Delete files to see them here"
      />

      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          mimeType={previewFile.mimeType}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </Container>
  );
};

export default RecycleBin;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 32px;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  color: #202124;
  margin: 0;
`;

const FileCount = styled.div`
  font-size: 14px;
  color: #5f6368;
`;
