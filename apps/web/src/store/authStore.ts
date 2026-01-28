import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";
import { hardReload } from "../lib/hardReload";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  storage_limit?: number;
  last_location?: string;
  file_count?: number;
  total_storage?: number;
  pinned_count?: number;
  offline_count?: number;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  currentDevice: Device | null;
  devices: Device[];

  requires2FA: boolean;
  tempToken: string | null;

  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setCurrentDevice: (device: Device | null) => void;
  setDevices: (devices: Device[]) => void;
  clearError: () => void;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // Device management
  fetchCurrentDevice: (accessToken: string) => Promise<void>;
  fetchDevices: (accessToken: string) => Promise<void>;
  updateDevice: (deviceId: string, updates: Partial<Device>) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;

  // 2FA methods
  setupTOTP: () => Promise<{
    secret: string;
    qrCode: string;
    otpauthUrl: string;
  }>;
  verifyAndEnableTOTP: (token: string) => Promise<{ recoveryCodes: string[] }>;
  verifyTOTP: (token: string) => Promise<void>;
  verifyRecoveryCode: (code: string) => Promise<void>;
  disableTOTP: () => Promise<void>;

  // Passkey methods
  registerPasskey: (deviceName?: string) => Promise<void>;
  loginWithPasskey: () => Promise<void>;
  getPasskeys: () => Promise<any[]>;
  deletePasskey: (passkeyId: string) => Promise<void>;

  // OAuth methods
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
  loginWithFacebook: () => void;
  handleOAuthCallback: (token: string, refresh: string) => Promise<void>;
  getSocialAccounts: () => Promise<any[]>;
  unlinkSocialAccount: (provider: string) => Promise<void>;
}

interface APIResponse<T> {
  data: T;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error))
    return error.response?.data?.error || error.message || "Unknown error";
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      currentDevice: null,
      devices: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      requires2FA: false,
      tempToken: null,

      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setCurrentDevice: (device) => set({ currentDevice: device }),
      setDevices: (devices) => set({ devices }),
      clearError: () => set({ error: null }),

      // ----------------------
      // Auth methods
      // ----------------------
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res: APIResponse<any> = await axios.post(
            `${API_URL}/auth/login`,
            { email, password },
            { withCredentials: true },
          );

          if (res.data.requires2FA) {
            set({
              requires2FA: true,
              tempToken: res.data.tempToken,
              isLoading: false,
            });
            return;
          }

          localStorage.setItem("accessToken", res.data.accessToken);
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            requires2FA: false,
            tempToken: null,
          });

          // fetch devices
          await get().fetchDevices(res.data.accessToken);
        } catch (err) {
          const error = getErrorMessage(err);
          set({ error, isLoading: false });
          throw new Error(error);
        }
      },

      register: async (email, password, firstName) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(
            `${API_URL}/auth/register`,
            { email, password, firstName },
            { withCredentials: true },
          );
          await get().login(email, password);
        } catch (err) {
          const error = getErrorMessage(err);
          set({ error, isLoading: false });
          throw new Error(error);
        }
      },

      logout: async () => {
        try {
          await axios.post(
            `${API_URL}/auth/logout`,
            {},
            { withCredentials: true },
          );
        } catch (err) {
          console.error("Logout failed:", getErrorMessage(err));
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
          });
          hardReload();
        }
      },

      refreshToken: async () => {
        try {
          const res: APIResponse<any> = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true },
          );
          set({ accessToken: res.data.accessToken });
        } catch (err) {
          await get().logout();
          throw new Error(getErrorMessage(err));
        }
      },

      checkAuth: async () => {
        const token = get().accessToken;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const res: APIResponse<any> = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          set({ user: res.data.user, isAuthenticated: true });
          await get().fetchDevices(token);
        } catch (err) {
          try {
            await get().refreshToken();
            await get().checkAuth();
          } catch {
            await get().logout();
          }
        }
      },

      // ----------------------
      // Device management
      // ----------------------
      fetchCurrentDevice: async (accessToken) => {
        try {
          const res: APIResponse<any> = await axios.get(
            `${API_URL}/auth/device/current`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              withCredentials: true,
            },
          );
          if (res.data.success) set({ currentDevice: res.data.device });
        } catch (err) {
          console.error(err);
        }
      },

      fetchDevices: async (accessToken) => {
        try {
          const res: APIResponse<any> = await axios.get(`${API_URL}/devices`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          });
          if (res.data.success) {
            set({ devices: res.data.devices });
            const currentDevice = res.data.devices.find(
              (d: Device) => d.is_current,
            );
            if (currentDevice) set({ currentDevice });
          }
        } catch (err) {
          console.error(err);
        }
      },

      updateDevice: async (deviceId, updates) => {
        const token = get().accessToken;
        if (!token) throw new Error("Not authenticated");
        try {
          const res = await axios.patch(
            `${API_URL}/devices/${deviceId}`,
            updates,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            },
          );
          if (res.data.success) {
            set((state) => ({
              devices: state.devices.map((d) =>
                d.id === deviceId ? { ...d, ...res.data.device } : d,
              ),
              currentDevice:
                state.currentDevice?.id === deviceId
                  ? { ...state.currentDevice, ...res.data.device }
                  : state.currentDevice,
            }));
          }
        } catch (err) {
          console.error(err);
          throw err;
        }
      },

      removeDevice: async (deviceId) => {
        const token = get().accessToken;
        if (!token) throw new Error("Not authenticated");
        try {
          const res = await axios.delete(`${API_URL}/devices/${deviceId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          if (res.data.success) {
            set((state) => ({
              devices: state.devices.filter((d) => d.id !== deviceId),
            }));
          }
        } catch (err) {
          console.error(err);
          throw err;
        }
      },

      // ----------------------
      // 2FA Methods
      // ----------------------
      setupTOTP: async () => {
        try {
          const res = await axios.post(
            `${API_URL}/auth/totp/setup`,
            {},
            { withCredentials: true },
          );
          return res.data;
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },

      verifyAndEnableTOTP: async (token) => {
        try {
          const res = await axios.post(
            `${API_URL}/auth/totp/verify-and-enable`,
            { token },
            { withCredentials: true },
          );
          return res.data;
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },

      verifyTOTP: async (token) => {
        set({ isLoading: true, error: null });
        try {
          const { tempToken } = get();
          const res = await axios.post(
            `${API_URL}/auth/totp/verify`,
            { tempToken, token },
            { withCredentials: true },
          );
          localStorage.setItem("accessToken", res.data.accessToken);
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
        } catch (err) {
          const error = getErrorMessage(err);
          set({ error, isLoading: false });
          throw new Error(error);
        }
      },

      verifyRecoveryCode: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const { tempToken } = get();
          const res = await axios.post(
            `${API_URL}/auth/totp/verify`,
            { tempToken, recoveryCode: code },
            { withCredentials: true },
          );
          localStorage.setItem("accessToken", res.data.accessToken);
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
        } catch (err) {
          const error = getErrorMessage(err);
          set({ error, isLoading: false });
          throw new Error(error);
        }
      },

      disableTOTP: async () => {
        try {
          await axios.post(
            `${API_URL}/auth/totp/disable`,
            {},
            { withCredentials: true },
          );
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },

      // ----------------------
      // Passkey Methods
      // ----------------------
      registerPasskey: async (deviceName) => {
        try {
          const { startRegistration } = await import("@simplewebauthn/browser");
          const optionsRes = await axios.get(
            `${API_URL}/auth/webauthn/registration-options`,
            { withCredentials: true },
          );
          const credential = await startRegistration(optionsRes.data.options);
          await axios.post(
            `${API_URL}/auth/webauthn/register`,
            { response: credential, deviceName: deviceName || "My Device" },
            { withCredentials: true },
          );
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },

      loginWithPasskey: async () => {
        set({ isLoading: true, error: null });
        try {
          const { startAuthentication } =
            await import("@simplewebauthn/browser");
          const optionsRes = await axios.get(
            `${API_URL}/auth/webauthn/authentication-options`,
            { withCredentials: true },
          );
          const credential = await startAuthentication(optionsRes.data.options);
          const res = await axios.post(
            `${API_URL}/auth/webauthn/authenticate`,
            { response: credential },
            { withCredentials: true },
          );
          localStorage.setItem("accessToken", res.data.accessToken);
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const error = getErrorMessage(err);
          set({ error, isLoading: false });
          throw new Error(error);
        }
      },

      getPasskeys: async () => {
        try {
          const res = await axios.get(`${API_URL}/auth/passkeys`, {
            withCredentials: true,
          });
          return res.data.passkeys;
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },

      deletePasskey: async (passkeyId) => {
        try {
          await axios.delete(`${API_URL}/auth/passkeys/${passkeyId}`, {
            withCredentials: true,
          });
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },

      // ----------------------
      // OAuth Methods
      // ----------------------
      loginWithGoogle: () => {
        window.location.href = `${API_URL}/auth/oauth/google`;
      },
      loginWithGitHub: () => {
        window.location.href = `${API_URL}/auth/oauth/github`;
      },
      loginWithFacebook: () => {
        window.location.href = `${API_URL}/auth/oauth/facebook`;
      },

      handleOAuthCallback: async (token, refresh) => {
        localStorage.setItem("accessToken", token);
        const res: APIResponse<any> = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        set({ user: res.data.user, isAuthenticated: true });
      },

      getSocialAccounts: async () => {
        try {
          const res = await axios.get(`${API_URL}/auth/social-accounts`, {
            withCredentials: true,
          });
          return res.data.accounts;
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },

      unlinkSocialAccount: async (provider) => {
        try {
          await axios.delete(`${API_URL}/auth/social-accounts/${provider}`, {
            withCredentials: true,
          });
        } catch (err) {
          throw new Error(getErrorMessage(err));
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        requires2FA: state.requires2FA,
        tempToken: state.tempToken,
      }),
    },
  ),
);
