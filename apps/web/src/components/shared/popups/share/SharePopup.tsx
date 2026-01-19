import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  X,
  Link2,
  Mail,
  Lock,
  Calendar,
  Download,
  Eye,
  Edit3,
  MessageSquare,
  Copy,
  Check,
  Users,
  Globe,
  ChevronDown,
  Settings,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";

interface SharePopupProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

type Permission = "view" | "comment" | "edit" | "download";
type ShareType = "link" | "email" | "internal";

interface Share {
  id: string;
  token: string;
  url: string;
  permission: Permission;
  shareType: ShareType;
  hasPassword: boolean;
  expiresAt: string | null;
  maxDownloads: number | null;
  downloadCount: number;
  recipientCount: number;
  accessCount: number;
  createdAt: string;
}

interface Recipient {
  type: "user" | "email";
  value: string;
  permission?: Permission;
}

const SharePopup: React.FC<SharePopupProps> = ({
  fileId,
  fileName,
  onClose,
}) => {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [activeTab, setActiveTab] = useState<"share" | "manage">("share");
  const [shareType, setShareType] = useState<ShareType>("link");
  const [permission, setPermission] = useState<Permission>("view");
  const [recipients, setRecipients] = useState<string>("");
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [maxDownloads, setMaxDownloads] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingShares, setExistingShares] = useState<Share[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchExistingShares();
  }, [fileId, accessToken]);

  const fetchExistingShares = async () => {
    try {
      const response = await fetch(`/api/sharing/file/${fileId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setExistingShares(data.shares);
      }
    } catch (err) {
      console.error("Error fetching shares:", err);
    }
  };

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const recipientsList: Recipient[] = recipients
        .split(/[,\n]/)
        .map((r) => r.trim())
        .filter(Boolean)
        .map((value) => ({
          type: value.includes("@") ? "email" : "user",
          value,
          permission,
        }));

      const response = await fetch("/api/sharing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fileId: parseInt(fileId),
          shareType,
          permission,
          password: password || undefined,
          expiresIn,
          maxDownloads,
          recipients: recipientsList.length > 0 ? recipientsList : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedUrl(data.share.url);
        fetchExistingShares();

        // Reset form
        setRecipients("");
        setPassword("");
        setExpiresIn(null);
        setMaxDownloads(null);
        setShowAdvanced(false);
      }
    } catch (err) {
      console.error("Error creating share:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await fetch(`/api/sharing/${shareId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchExistingShares();
    } catch (err) {
      console.error("Error revoking share:", err);
    }
  };

  const getPermissionIcon = (perm: Permission) => {
    switch (perm) {
      case "view":
        return <Eye size={16} />;
      case "comment":
        return <MessageSquare size={16} />;
      case "edit":
        return <Edit3 size={16} />;
      case "download":
        return <Download size={16} />;
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Users size={24} />
            Share "{fileName}"
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <TabBar>
          <Tab
            $active={activeTab === "share"}
            onClick={() => setActiveTab("share")}
          >
            Share
          </Tab>
          <Tab
            $active={activeTab === "manage"}
            onClick={() => setActiveTab("manage")}
          >
            Manage ({existingShares.length})
          </Tab>
        </TabBar>

        {activeTab === "share" && (
          <Content>
            <Section>
              <SectionTitle>Share via</SectionTitle>
              <ShareTypeSelector>
                <ShareTypeOption
                  $active={shareType === "link"}
                  onClick={() => setShareType("link")}
                >
                  <Link2 size={20} />
                  <div>
                    <OptionTitle>Link</OptionTitle>
                    <OptionDesc>Anyone with the link</OptionDesc>
                  </div>
                </ShareTypeOption>
                <ShareTypeOption
                  $active={shareType === "email"}
                  onClick={() => setShareType("email")}
                >
                  <Mail size={20} />
                  <div>
                    <OptionTitle>Email</OptionTitle>
                    <OptionDesc>Send to specific people</OptionDesc>
                  </div>
                </ShareTypeOption>
                <ShareTypeOption
                  $active={shareType === "internal"}
                  onClick={() => setShareType("internal")}
                >
                  <Users size={20} />
                  <div>
                    <OptionTitle>Internal</OptionTitle>
                    <OptionDesc>Share with team members</OptionDesc>
                  </div>
                </ShareTypeOption>
              </ShareTypeSelector>
            </Section>

            {(shareType === "email" || shareType === "internal") && (
              <Section>
                <Label>
                  {shareType === "email" ? "Email addresses" : "Team members"}
                </Label>
                <Input
                  as="textarea"
                  rows={3}
                  placeholder={
                    shareType === "email"
                      ? "Enter email addresses, separated by commas or new lines"
                      : "Enter usernames or emails"
                  }
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
              </Section>
            )}

            <Section>
              <Label>Permission level</Label>
              <PermissionGrid>
                <PermissionCard
                  $active={permission === "view"}
                  onClick={() => setPermission("view")}
                >
                  <Eye size={20} />
                  <PermissionName>View only</PermissionName>
                </PermissionCard>
                <PermissionCard
                  $active={permission === "comment"}
                  onClick={() => setPermission("comment")}
                >
                  <MessageSquare size={20} />
                  <PermissionName>Comment</PermissionName>
                </PermissionCard>
                <PermissionCard
                  $active={permission === "edit"}
                  onClick={() => setPermission("edit")}
                >
                  <Edit3 size={20} />
                  <PermissionName>Edit</PermissionName>
                </PermissionCard>
                <PermissionCard
                  $active={permission === "download"}
                  onClick={() => setPermission("download")}
                >
                  <Download size={20} />
                  <PermissionName>Download</PermissionName>
                </PermissionCard>
              </PermissionGrid>
            </Section>

            <AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
              <Settings size={16} />
              Advanced options
              <ChevronDown
                size={16}
                style={{
                  transform: showAdvanced ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </AdvancedToggle>

            {showAdvanced && (
              <AdvancedSection>
                <AdvancedRow>
                  <AdvancedLabel>
                    <Lock size={16} />
                    Password protection
                  </AdvancedLabel>
                  <Input
                    type="password"
                    placeholder="Optional password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </AdvancedRow>

                <AdvancedRow>
                  <AdvancedLabel>
                    <Calendar size={16} />
                    Expiration
                  </AdvancedLabel>
                  <Select
                    value={expiresIn || ""}
                    onChange={(e) =>
                      setExpiresIn(
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">Never</option>
                    <option value="1">1 hour</option>
                    <option value="24">24 hours</option>
                    <option value="168">7 days</option>
                    <option value="720">30 days</option>
                  </Select>
                </AdvancedRow>

                <AdvancedRow>
                  <AdvancedLabel>
                    <Download size={16} />
                    Download limit
                  </AdvancedLabel>
                  <Input
                    type="number"
                    min="1"
                    placeholder="No limit"
                    value={maxDownloads || ""}
                    onChange={(e) =>
                      setMaxDownloads(
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  />
                </AdvancedRow>
              </AdvancedSection>
            )}

            {generatedUrl && (
              <GeneratedLinkSection>
                <GeneratedLinkLabel>
                  <Check size={16} color="#10b981" />
                  Share link created!
                </GeneratedLinkLabel>
                <LinkDisplay>
                  <LinkText>{generatedUrl}</LinkText>
                  <CopyButton onClick={() => handleCopyUrl(generatedUrl)}>
                    {copiedUrl === generatedUrl ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </CopyButton>
                </LinkDisplay>
              </GeneratedLinkSection>
            )}

            <ActionButtons>
              <CancelButton onClick={onClose}>Cancel</CancelButton>
              <CreateButton onClick={handleCreateShare} disabled={loading}>
                {loading ? "Creating..." : "Create share link"}
              </CreateButton>
            </ActionButtons>
          </Content>
        )}

        {activeTab === "manage" && (
          <Content>
            {existingShares.length === 0 ? (
              <EmptyState>
                <Globe size={48} color="#dadce0" />
                <EmptyText>No active shares</EmptyText>
                <EmptySubtext>Create a share link to get started</EmptySubtext>
              </EmptyState>
            ) : (
              <SharesList>
                {existingShares.map((share) => (
                  <ShareItem key={share.id}>
                    <ShareItemHeader>
                      <ShareItemInfo>
                        {getPermissionIcon(share.permission)}
                        <ShareItemTitle>
                          {share.shareType === "link"
                            ? "Anyone with link"
                            : `${share.recipientCount} recipient${
                                share.recipientCount !== 1 ? "s" : ""
                              }`}
                        </ShareItemTitle>
                      </ShareItemInfo>
                      <ShareItemActions>
                        <IconButton onClick={() => handleCopyUrl(share.url)}>
                          {copiedUrl === share.url ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </IconButton>
                        <IconButton onClick={() => handleRevokeShare(share.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </ShareItemActions>
                    </ShareItemHeader>
                    <ShareItemDetails>
                      <Detail>
                        {share.accessCount} view
                        {share.accessCount !== 1 ? "s" : ""}
                      </Detail>
                      {share.hasPassword && (
                        <Detail>
                          <Lock size={12} /> Protected
                        </Detail>
                      )}
                      {share.expiresAt && (
                        <Detail>
                          <Calendar size={12} /> Expires{" "}
                          {new Date(share.expiresAt).toLocaleDateString()}
                        </Detail>
                      )}
                    </ShareItemDetails>
                  </ShareItem>
                ))}
              </SharesList>
            )}
          </Content>
        )}
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e8eaed;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #202124;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6368;
  transition: all 0.15s;

  &:hover {
    background: #f1f3f4;
  }
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e8eaed;
  padding: 0 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => (p.$active ? "#1a73e8" : "#5f6368")};
  cursor: pointer;
  border-bottom: 2px solid ${(p) => (p.$active ? "#1a73e8" : "transparent")};
  transition: all 0.15s;

  &:hover {
    color: #1a73e8;
  }
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #5f6368;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ShareTypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const ShareTypeOption = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "#e8f0fe" : "#f8f9fa")};
  border: 2px solid ${(p) => (p.$active ? "#1a73e8" : "transparent")};
  border-radius: 12px;
  padding: 16px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
  color: ${(p) => (p.$active ? "#1a73e8" : "#5f6368")};

  &:hover {
    background: ${(p) => (p.$active ? "#e8f0fe" : "#f1f3f4")};
  }

  svg {
    flex-shrink: 0;
  }
`;

const OptionTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #202124;
  text-align: center;
`;

const OptionDesc = styled.div`
  font-size: 11px;
  color: #5f6368;
  text-align: center;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  color: #202124;
  transition: all 0.15s;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  color: #202124;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const PermissionCard = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "#e8f0fe" : "#f8f9fa")};
  border: 2px solid ${(p) => (p.$active ? "#1a73e8" : "transparent")};
  border-radius: 12px;
  padding: 16px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
  color: ${(p) => (p.$active ? "#1a73e8" : "#5f6368")};

  &:hover {
    background: ${(p) => (p.$active ? "#e8f0fe" : "#f1f3f4")};
  }
`;

const PermissionName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #202124;
  text-align: center;
`;

const AdvancedToggle = styled.button`
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1a73e8;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;

  &:hover {
    background: #f1f3f4;
  }
`;

const AdvancedSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const AdvancedRow = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AdvancedLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5f6368;
`;

const GeneratedLinkSection = styled.div`
  background: #e8f5e9;
  border: 1px solid #10b981;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const GeneratedLinkLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #10b981;
  margin-bottom: 12px;
`;

const LinkDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 8px;
  padding: 12px;
`;

const LinkText = styled.div`
  flex: 1;
  font-size: 13px;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyButton = styled.button`
  background: #f8f9fa;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #5f6368;
  transition: all 0.15s;

  &:hover {
    background: #e8eaed;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: transparent;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #f8f9fa;
  }
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #1557b0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SharesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShareItem = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
`;

const ShareItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ShareItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #5f6368;
`;

const ShareItemTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
`;

const ShareItemActions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #5f6368;
  transition: all 0.15s;

  &:hover {
    background: #e8eaed;
  }
`;

const ShareItemDetails = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const Detail = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #5f6368;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #5f6368;
  margin-top: 16px;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  color: #80868b;
  margin-top: 4px;
`;

export default SharePopup;
