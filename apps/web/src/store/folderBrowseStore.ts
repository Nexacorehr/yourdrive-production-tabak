import { create } from "zustand";

interface FolderBrowseState {
  yourFilesPath: string;
  setYourFilesPath: (path: string) => void;
}

export const useFolderBrowseStore = create<FolderBrowseState>((set) => ({
  yourFilesPath: "",
  setYourFilesPath: (path) => set({ yourFilesPath: path }),
}));
