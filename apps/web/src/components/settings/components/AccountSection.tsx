import React, { useState } from "react";
import {
  Section,
  SectionTitle,
  SectionDescription,
  ProfilePictureWrapper,
  Avatar,
  ButtonGroup,
  Button,
  SmallText,
  FormGroup,
  Label,
  Input,
  GridTwo,
  DangerZone,
  DangerItem,
  DangerInfo,
  DangerTitle,
  DangerDescription,
  ContactEmail,
} from "../styles/settings.styles";

interface AccountSectionProps {
  settings: any;
  updateProfile: (data: any) => Promise<void>;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  settings,
  updateProfile,
}) => {
  const [formData, setFormData] = useState({
    email: settings?.profile?.email || "",
    firstName: settings?.profile?.firstName || "",
    lastName: settings?.profile?.lastName || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage("");
      await updateProfile(formData);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName.charAt(0).toUpperCase();
    const last = formData.lastName.charAt(0).toUpperCase();
    return `${first}${last}` || "??";
  };

  return (
    <>
      <Section>
        <SectionTitle>Profile</SectionTitle>
        <SectionDescription>
          Manage your personal information and profile picture
        </SectionDescription>

        <ProfilePictureWrapper>
          <Avatar>{getInitials()}</Avatar>
          <ButtonGroup>
            <Button>Change Avatar</Button>
            <Button>Remove</Button>
          </ButtonGroup>
        </ProfilePictureWrapper>
        <SmallText>Recommended: Square image, at least 400x400px</SmallText>
      </Section>

      <Section>
        <SectionTitle>Personal Information</SectionTitle>
        <SectionDescription>
          Update your name and email address
        </SectionDescription>

        <FormGroup>
          <Label>
            Email <span>*</span>
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="your@email.com"
          />
        </FormGroup>

        <GridTwo>
          <FormGroup>
            <Label>
              First Name <span>*</span>
            </Label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              placeholder="First name"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Last Name <span>*</span>
            </Label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              placeholder="Last name"
            />
          </FormGroup>
        </GridTwo>

        {message && (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              background: message.includes("success") ? "#dcfce7" : "#fee2e2",
              color: message.includes("success") ? "#15803d" : "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            {message}
          </div>
        )}

        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Section>

      <Section>
        <DangerZone>
          <SectionTitle>Delete Account</SectionTitle>
          <SectionDescription>
            Permanently delete your account and all associated data
          </SectionDescription>

          <DangerItem>
            <DangerInfo>
              <DangerTitle>This action cannot be undone</DangerTitle>
              <DangerDescription>
                All your files, folders, and settings will be permanently
                deleted. Please contact{" "}
                <ContactEmail>support@yourdrive.com</ContactEmail> to proceed.
              </DangerDescription>
            </DangerInfo>
          </DangerItem>
        </DangerZone>
      </Section>
    </>
  );
};
