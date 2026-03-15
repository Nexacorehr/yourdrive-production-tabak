import React, { useState, useEffect } from "react";
import { HardDrive, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import styled from "styled-components";
import {
  Section,
  SectionTitle,
  SectionDescription,
  StorageBar,
  StorageFill,
  Button,
  ButtonGroup,
  InfoCard,
  InfoText,
} from "../styles/settings.styles";
import api from "../../../lib/axios";

interface StorageInfo {
  limit: string; // bytes as string
  used: string; // bytes as string
  available: string; // bytes as string
  usagePercentage: number;
  tier: string;
  deviceName: string;
}

export const StorageSection: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  const fetchStorageInfo = async () => {
    try {
      setStorageLoading(true);
      const response = await api.get("/storage/info");

      if (response.data.success) {
        setStorageInfo({
          limit: response.data.limit,
          used: response.data.used,
          available: response.data.available,
          usagePercentage: response.data.usagePercentage,
          tier: response.data.tier,
          deviceName: response.data.deviceName,
        });
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    } finally {
      setStorageLoading(false);
    }
  };

  const formatBytes = (bytes: string | number | bigint): string => {
    let bytesNum: number;

    if (typeof bytes === "bigint") {
      bytesNum = Number(bytes);
    } else if (typeof bytes === "string") {
      bytesNum = Number(bytes);
    } else {
      bytesNum = bytes;
    }

    if (bytesNum === 0) return "0 B";
    if (isNaN(bytesNum)) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytesNum) / Math.log(k));

    return `${(bytesNum / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 70) return "#10b981"; // green
    if (percentage < 90) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the cache? This may affect offline access.",
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await api.post("/storage/clear-cache");
      setFeedback("Cache cleared successfully.");
    } catch {
      setFeedback("Failed to clear cache.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (
      !confirm(
        "This will scan for and remove duplicate files. This may take some time.",
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await api.post("/storage/remove-duplicates");
      setFeedback("Duplicate files removed successfully.");
      fetchStorageInfo(); // Refresh storage info
    } catch {
      setFeedback("Failed to remove duplicates.");
    } finally {
      setLoading(false);
    }
  };

  // File versioning is not supported in this version; no max versions setting.

  if (storageLoading) {
    return (
      <Section>
        <SectionTitle>Storage Usage</SectionTitle>
        <SectionDescription>Loading storage information...</SectionDescription>
      </Section>
    );
  }

  const usedPercentage = storageInfo?.usagePercentage || 0;
  const totalStorage = storageInfo ? BigInt(storageInfo.limit) : 0n;
  const usedStorage = storageInfo ? BigInt(storageInfo.used) : 0n;
  const availableStorage = storageInfo ? BigInt(storageInfo.available) : 0n;

  return (
    <>
      <Section>
        <SectionTitle>Storage Usage</SectionTitle>
        <SectionDescription>
          Monitor and manage your storage space
        </SectionDescription>

        {storageInfo?.tier && (
          <TierCard>
            <HardDrive size={20} color="#1F9AFE" />
            <div>
              <TierTitle>{storageInfo.tier}</TierTitle>
              <TierMeta>
                Current storage plan
              </TierMeta>
            </div>
          </TierCard>
        )}

        <UsageWrap>
          <UsageTop>
            <div>
              <UsageValue>{formatBytes(usedStorage)}</UsageValue>
              <UsageMeta>
                of {formatBytes(totalStorage)} used
                {storageInfo?.deviceName && ` on ${storageInfo.deviceName}`}
              </UsageMeta>
            </div>
            <UsagePct style={{ color: getUsageColor(usedPercentage) }}>
              {usedPercentage.toFixed(1)}%
            </UsagePct>
          </UsageTop>

          <StorageBar>
            <StorageFill
              $percentage={usedPercentage}
              color={getUsageColor(usedPercentage)}
            />
          </StorageBar>

          <StorageInfoRow>
            <span>{formatBytes(usedStorage)} used</span>
            <span>{formatBytes(availableStorage)} available</span>
          </StorageInfoRow>
        </UsageWrap>

        {usedPercentage > 80 && (
          <InfoCard
            style={{
              background: usedPercentage > 90 ? "#fef2f2" : "#fef3c7",
              border:
                usedPercentage > 90 ? "1px solid #fecaca" : "1px solid #fde68a",
            }}
          >
            <InfoText
              style={{ color: usedPercentage > 90 ? "#991b1b" : "#92400e" }}
            >
              <AlertTriangle
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              {usedPercentage > 90
                ? "⚠️ Your storage is almost full! Please delete files or upgrade your plan."
                : "You're running low on storage space. Consider upgrading or deleting unused files."}
            </InfoText>
          </InfoCard>
        )}
      </Section>

      <Section>
        <SectionTitle>Storage Settings</SectionTitle>
        <SectionDescription>
          Storage behavior settings will be expanded in the next release.
        </SectionDescription>
      </Section>

      <Section>
        <SectionTitle>Storage Management</SectionTitle>
        <SectionDescription>
          Free up space by managing cached files and versions
        </SectionDescription>

        <ButtonGroup>
          <Button onClick={handleClearCache} disabled={loading}>
            <Trash2 size={16} />
            Clear Cache
          </Button>
          <Button onClick={handleRemoveDuplicates} disabled={loading}>
            <RefreshCw size={16} />
            Remove Duplicates
          </Button>
        </ButtonGroup>

        {feedback && (
          <InfoCard style={{ marginTop: "0.8rem" }}>
            <InfoText>{feedback}</InfoText>
          </InfoCard>
        )}

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

const TierCard = styled.div`
  background: #f2f8ff;
  border: 1px solid #cfe5fb;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TierTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f9afe;
`;

const TierMeta = styled.div`
  font-size: 0.85rem;
  color: #60748a;
`;

const UsageWrap = styled.div`
  margin-bottom: 1.4rem;
`;

const UsageTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 12px;
`;

const UsageValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #17324c;
`;

const UsageMeta = styled.div`
  font-size: 0.85rem;
  color: #62758b;
`;

const UsagePct = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
`;

const StorageInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6a7d92;
`;
