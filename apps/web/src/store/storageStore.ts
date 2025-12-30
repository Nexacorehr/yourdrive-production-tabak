import { create } from "zustand";

interface StorageState {
  usedBytes: number;
  totalBytes: number;
  setUsed: (bytes: number) => void;
  addUsage: (bytes: number) => void;
  removeUsage: (bytes: number) => void;
  getUsedFormatted: () => string;
  getTotalFormatted: () => string;
  getPercentage: () => number;
  refreshStorage: (accessToken: string | null) => Promise<void>;
}

// 15 GB in bytes
const DEFAULT_TOTAL_BYTES = 15 * 1024 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
}

export const useStorageStore = create<StorageState>((set, get) => ({
  usedBytes: 0,
  totalBytes: DEFAULT_TOTAL_BYTES,

  setUsed: (bytes) => set({ usedBytes: bytes }),

  addUsage: (bytes) =>
    set((state) => ({
      usedBytes: Math.min(state.usedBytes + bytes, state.totalBytes),
    })),

  removeUsage: (bytes) =>
    set((state) => ({
      usedBytes: Math.max(0, state.usedBytes - bytes),
    })),

  getUsedFormatted: () => formatBytes(get().usedBytes),

  getTotalFormatted: () => formatBytes(get().totalBytes),

  getPercentage: () => {
    const { usedBytes, totalBytes } = get();
    return usedBytes / totalBytes;
  },

  refreshStorage: async (accessToken: string | null) => {
    if (!accessToken) {
      throw new Error("Access token is required to refresh storage");
    }

    set({ loading: true });

    try {
      // Fetch all usage from backend
      const response = await fetch("/api/files/usage", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const data = await response.json();
      const totalUsed = data.usage.totalSize;

      set({
        usedBytes: totalUsed,
        loading: false,
        lastUpdated: new Date(),
      });

      console.log(
        `Storage refreshed: ${formatBytes(totalUsed)} / ${formatBytes(
          get().totalBytes
        )}`
      );
    } catch (error) {
      console.error("Failed to refresh storage:", error);
      set({ loading: false });
      throw error;
    }
  },
}));
