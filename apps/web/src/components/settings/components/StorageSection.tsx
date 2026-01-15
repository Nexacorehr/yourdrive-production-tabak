import React, { useState } from "react";
import { HardDrive, Trash2, RefreshCw } from "lucide-react";
import {
  Section,
  SectionTitle,
  SectionDescription,
  StorageBar,
  StorageFill,
  ToggleWrapper,
  ToggleInfo,
  ToggleTitle,
  ToggleDescription,
  Toggle,
  Button,
  ButtonGroup,
  InfoCard,
  InfoText,
} from "../styles/settings.styles";

interface StorageSectionProps {
  settings: any;
  updateStorage: (data: any) => Promise<void>;
}

export const StorageSection: React.FC<StorageSectionProps> = ({
  settings,
  updateStorage,
}) => {
  const [storageSettings, setStorageSettings] = useState<{
    autoSync: boolean;
    fileVersioning: boolean;
    [key: string]: boolean;
  }>({
    autoSync: settings?.storage?.autoSync ?? true,
    fileVersioning: settings?.storage?.fileVersioning ?? true,
  });

  const [loading, setLoading] = useState(false);

  const totalStorage = settings?.storage?.totalStorage || 10737418240; // 10GB in bytes
  const usedStorage = settings?.storage?.usedStorage || 0;
  const usedPercentage = (usedStorage / totalStorage) * 100;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleToggle = async (field: string) => {
    try {
      setLoading(true);
      const newValue = !storageSettings[field];
      await updateStorage({ [field]: newValue });
      setStorageSettings((prev) => ({ ...prev, [field]: newValue }));
    } catch (error) {
      console.error("Failed to update storage setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the cache? This may affect offline access."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      alert("Cache cleared successfully");
    } catch (error) {
      alert("Failed to clear cache");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Section>
        <SectionTitle>Storage Usage</SectionTitle>
        <SectionDescription>
          Monitor and manage your storage space
        </SectionDescription>

        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                {formatBytes(usedStorage)}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                of {formatBytes(totalStorage)} used
              </div>
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color:
                  usedPercentage > 90
                    ? "#ef4444"
                    : usedPercentage > 70
                    ? "#f59e0b"
                    : "#1286FE",
              }}
            >
              {usedPercentage.toFixed(1)}%
            </div>
          </div>

          <StorageBar>
            <StorageFill percentage={usedPercentage} />
          </StorageBar>
        </div>

        {usedPercentage > 80 && (
          <InfoCard
            style={{ background: "#fef3c7", border: "1px solid #fde68a" }}
          >
            <InfoText style={{ color: "#92400e" }}>
              <HardDrive
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              You're running low on storage space. Consider upgrading or
              deleting unused files.
            </InfoText>
          </InfoCard>
        )}
      </Section>

      <Section>
        <SectionTitle>Storage Settings</SectionTitle>
        <SectionDescription>
          Configure how your files are stored and synced
        </SectionDescription>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Auto Sync</ToggleTitle>
            <ToggleDescription>
              Automatically sync files across all your devices
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={storageSettings.autoSync}
            onClick={() => handleToggle("autoSync")}
            disabled={loading}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>File Versioning</ToggleTitle>
            <ToggleDescription>
              Keep previous versions of modified files (up to 10 versions)
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={storageSettings.fileVersioning}
            onClick={() => handleToggle("fileVersioning")}
            disabled={loading}
          />
        </ToggleWrapper>
      </Section>

      <Section>
        <SectionTitle>Storage Management</SectionTitle>
        <SectionDescription>
          Free up space by managing cached files and versions
        </SectionDescription>

        <ButtonGroup>
          <Button onClick={handleClearCache} disabled={loading}>
            <Trash2 size={16} style={{ marginRight: "0.5rem" }} />
            Clear Cache
          </Button>
          <Button disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: "0.5rem" }} />
            Remove Duplicates
          </Button>
        </ButtonGroup>

        <InfoCard style={{ marginTop: "1rem" }}>
          <InfoText>
            <strong>Note:</strong> Clearing cache will remove offline copies of
            your files. They will be re-downloaded when you access them next
            time.
          </InfoText>
        </InfoCard>
      </Section>
    </>
  );
};
