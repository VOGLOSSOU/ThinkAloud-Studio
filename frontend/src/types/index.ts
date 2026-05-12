export type EpisodeStatus = "draft" | "ready" | "exported";

export interface ExportRecord {
  format: string;
  path: string;
  size_bytes: number;
  exported_at: string;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  status: EpisodeStatus;
  audio_path: string | null;
  cover_path: string | null;
  thumbnail_path: string | null;
  duration_sec: number | null;
  created_at: string;
  updated_at: string;
  exports: ExportRecord[];
}

export interface AudioDevice {
  index: number;
  name: string;
  channels: number;
}

export interface RecordingStatus {
  active: boolean;
  paused: boolean;
  episode_id: string | null;
  duration_sec: number;
}

export type EpisodeTab = "recording" | "metadata" | "cover" | "thumbnail" | "export";
