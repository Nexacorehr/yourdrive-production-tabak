import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";
import { hardReload } from "../lib/hardReload";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface Device {
  id: string;
  device_name: string;
  device_nickname?: string;
  device_type: string;
  device_color: string;
  browser: string;
  os: string;
  ip_address?: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
  is_trusted: boolean;
  sync_enabled: boolean;
  notifications_enabled: boolean;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isLoading: boolean;
  error: string | null;

  currentDevice: Device | null;
  devices: Device[];

  requires2FA: boolean;
  tempToken: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;

  fetchCurrentDevice: () => Promise<void>;
  fetchDevices: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAuthReady: false,
      isLoading: false,
      error: null,

      currentDevice: null,
      devices: [],

      requires2FA: false,
      tempToken: null,

      // ----------------------
      // Auth
      // ----------------------
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        const res = await api.post("/auth/login", { email, password });

        if (res.data.requires2FA) {
          set({
            requires2FA: true,
            tempToken: res.data.tempToken,
            isLoading: false,
          });
          return;
        }

        set({
          user: res.data.user,
          accessToken: res.data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          requires2FA: false,
          tempToken: null,
        });

        await get().fetchDevices();
      },

      register: async (email, password, firstName) => {
        set({ isLoading: true, error: null });
        await api.post("/auth/register", { email, password, firstName });
        await get().login(email, password);
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignore
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            currentDevice: null,
            devices: [],
            requires2FA: false,
            tempToken: null,
            error: null,
            isAuthReady: true,
          });
          hardReload();
        }
      },

      refreshToken: async () => {
        const res = await api.post("/auth/refresh");
        set({ accessToken: res.data.accessToken });
      },

      checkAuth: async () => {
        try {
          await get().refreshToken();
          const res = await api.get("/auth/me");

          set({
            user: res.data.user,
            isAuthenticated: true,
            isAuthReady: true,
          });

          await get().fetchDevices();
        } catch {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isAuthReady: true,
          });
        }
      },

      // ----------------------
      // Devices
      // ----------------------
      fetchCurrentDevice: async () => {
        try {
          const res = await api.get("/auth/device/current");
          if (res.data?.device) {
            set({ currentDevice: res.data.device });
          }
        } catch {
          // DO NOT retry, DO NOT logout
        }
      },

      fetchDevices: async () => {
        try {
          const res = await api.get("/devices");
          if (res.data?.devices) {
            set({ devices: res.data.devices });

            const current = res.data.devices.find((d: Device) => d.is_current);
            if (current) set({ currentDevice: current });
          }
        } catch {
          // silent fail
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        requires2FA: state.requires2FA,
        tempToken: state.tempToken,
      }),
    },
  ),
);
