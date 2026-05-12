import { create } from "zustand";
import type { EpisodeTab } from "@/types";

interface UIState {
  currentEpisodeId: string | null;
  currentTab: EpisodeTab;
  setCurrentEpisode: (id: string | null) => void;
  setCurrentTab: (tab: EpisodeTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentEpisodeId: null,
  currentTab: "recording",
  setCurrentEpisode: (id) => set({ currentEpisodeId: id, currentTab: "recording" }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
}));

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  setRecording: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  setDuration: (v: number) => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  isPaused: false,
  duration: 0,
  setRecording: (v) => set({ isRecording: v }),
  setPaused: (v) => set({ isPaused: v }),
  setDuration: (v) => set({ duration: v }),
}));
