import type {
  UserSettings,
  UpdateProfileRequest,
  UpdateSecurityRequest,
  UpdateAppearanceRequest,
  UpdateLanguageRequest,
  UpdateStorageRequest,
  UpdateSharingRequest,
  UpdatePreferencesRequest,
  UpdatePrivacyRequest,
  LinkedAccount,
  ActiveSession,
} from "../types/UserSettings";

import { useAuthStore } from "../../../store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    return fetchAPI<UserSettings>("/settings");
  },

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await fetchAPI("/settings/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateSecurity(data: UpdateSecurityRequest): Promise<void> {
    await fetchAPI("/settings/security", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateAppearance(data: UpdateAppearanceRequest): Promise<void> {
    await fetchAPI("/settings/appearance", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateLanguage(data: UpdateLanguageRequest): Promise<void> {
    await fetchAPI("/settings/language", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateStorage(data: UpdateStorageRequest): Promise<void> {
    await fetchAPI("/settings/storage", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateSharing(data: UpdateSharingRequest): Promise<void> {
    await fetchAPI("/settings/sharing", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updatePreferences(data: UpdatePreferencesRequest): Promise<void> {
    await fetchAPI("/settings/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updatePrivacy(data: UpdatePrivacyRequest): Promise<void> {
    await fetchAPI("/settings/privacy", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await fetchAPI("/settings/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    return fetchAPI<LinkedAccount[]>("/settings/linked-accounts");
  },

  async linkAccount(
    provider: string,
    credentials: any
  ): Promise<LinkedAccount> {
    return fetchAPI<LinkedAccount>("/settings/linked-accounts", {
      method: "POST",
      body: JSON.stringify({ provider, credentials }),
    });
  },

  async unlinkAccount(accountId: string): Promise<void> {
    await fetchAPI(`/settings/linked-accounts/${accountId}`, {
      method: "DELETE",
    });
  },

  async getActiveSessions(): Promise<ActiveSession[]> {
    return fetchAPI<ActiveSession[]>("/settings/sessions");
  },

  async signOutSession(sessionId: string): Promise<void> {
    await fetchAPI(`/settings/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  async signOutAllSessions(): Promise<void> {
    await fetchAPI("/settings/sessions/all", {
      method: "DELETE",
    });
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("authToken");

    const response = await fetch(`${API_BASE_URL}/settings/avatar`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload avatar");
    }

    return response.json();
  },

  async deleteAvatar(): Promise<void> {
    await fetchAPI("/settings/avatar", {
      method: "DELETE",
    });
  },

  async enableTwoFactor(): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    return fetchAPI("/settings/2fa/enable", {
      method: "POST",
    });
  },

  async verifyTwoFactor(code: string): Promise<void> {
    await fetchAPI("/settings/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  async disableTwoFactor(password: string): Promise<void> {
    await fetchAPI("/settings/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },

  async regenerateBackupCodes(): Promise<{ backupCodes: string[] }> {
    return fetchAPI("/settings/2fa/backup-codes", {
      method: "POST",
    });
  },

  async getStorageUsage(): Promise<{
    total: number;
    used: number;
    breakdown: {
      documents: number;
      images: number;
      videos: number;
      other: number;
    };
  }> {
    return fetchAPI("/settings/storage/usage");
  },

  async clearCache(): Promise<void> {
    await fetchAPI("/settings/storage/cache", {
      method: "DELETE",
    });
  },

  async removeDuplicates(): Promise<{
    filesRemoved: number;
    spaceFreed: number;
  }> {
    return fetchAPI("/settings/storage/duplicates", {
      method: "DELETE",
    });
  },

  async deleteOldVersions(olderThanDays: number = 30): Promise<{
    versionsDeleted: number;
    spaceFreed: number;
  }> {
    return fetchAPI("/settings/storage/versions", {
      method: "DELETE",
      body: JSON.stringify({ olderThanDays }),
    });
  },

  async deleteAccount(): Promise<void> {
    await fetchAPI("/settings/account", {
      method: "DELETE",
    });
  },

  async cancelAccountDeletion(): Promise<void> {
    await fetchAPI("/settings/account/deletion/cancel", {
      method: "POST",
    });
  },

  async requestDataExport(): Promise<{ exportId: string }> {
    return fetchAPI("/settings/export", {
      method: "POST",
    });
  },

  async getExportStatus(exportId: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    downloadUrl?: string;
  }> {
    return fetchAPI(`/settings/export/${exportId}`);
  },

  async getSharedFilesStats(): Promise<{
    sharedByMe: number;
    sharedWithMe: number;
    publicLinks: number;
  }> {
    return fetchAPI("/settings/sharing/stats");
  },

  async revokeAllPublicLinks(): Promise<{ linksRevoked: number }> {
    return fetchAPI("/settings/sharing/links/revoke-all", {
      method: "POST",
    });
  },
};

// za testiranje

export const mockSettingsService = {
  async getSettings(): Promise<UserSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          profile: {
            email: "user@example.com",
            firstName: "John",
            lastName: "Doe",
            avatarInitials: "JD",
          },
          security: {
            twoFactorEnabled: false,
            clientSideEncryption: false,
            offlineModeEnabled: false,
            activeSessions: [],
          },
          appearance: {
            theme: "light",
            fileView: "grid",
            thumbnailQuality: "medium",
          },
          language: {
            displayLanguage: "en",
            dateFormat: "MM/DD/YYYY",
            timeFormat: "12-hour",
            timezone: "UTC",
          },
          storage: {
            totalStorage: 10737418240, // 10GB
            usedStorage: 6979321856, // 6.5GB
            autoSync: true,
            fileVersioning: true,
            maxVersionsToKeep: 10,
            cacheSize: 0,
          },
          sharing: {
            defaultLinkPermission: "view",
            allowPublicSharing: true,
            requirePasswordForLinks: false,
            linkExpirationDays: null,
            notifyOnShare: true,
            allowDownload: true,
          },
          linkedAccounts: [],
          preferences: {
            emailNotifications: true,
            desktopNotifications: false,
            pushNotifications: false,
            notifyOnUpload: true,
            notifyOnShare: true,
            notifyOnComment: true,
            notifyOnMention: true,
            weeklyDigest: false,
          },
          privacy: {
            showOnlineStatus: true,
            allowActivityTracking: true,
            shareUsageData: false,
            indexFilesForSearch: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }, 1000);
    });
  },

  async updateProfile(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateSecurity(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateAppearance(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateLanguage(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateStorage(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updateSharing(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updatePreferences(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async updatePrivacy(data: any): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async linkAccount(): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async unlinkAccount(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async signOutSession(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  async uploadAvatar(): Promise<any> {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve({ avatarUrl: "https://via.placeholder.com/150" }),
        500
      )
    );
  },

  async deleteAccount(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  },
};
