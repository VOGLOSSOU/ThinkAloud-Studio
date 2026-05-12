import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export default api;

export const episodesApi = {
  list: () => api.get("/episodes/").then((r) => r.data),
  get: (id: string) => api.get(`/episodes/${id}`).then((r) => r.data),
  create: (title = "Sans titre") => api.post("/episodes/", { title }).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/episodes/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/episodes/${id}`).then((r) => r.data),
};

export const recordingApi = {
  devices: () => api.get("/recording/devices").then((r) => r.data),
  status: () => api.get("/recording/status").then((r) => r.data),
  start: (episodeId: string, deviceIndex?: number) =>
    api.post(`/recording/start/${episodeId}`, null, { params: { device_index: deviceIndex } }).then((r) => r.data),
  pause: () => api.post("/recording/pause").then((r) => r.data),
  stop: (episodeId: string) => api.post(`/recording/stop/${episodeId}`).then((r) => r.data),
};

export const exportApi = {
  audio: (episodeId: string, formats: string[], musicFile?: string, musicVolume = 0.12) =>
    api.post(`/export/${episodeId}/audio`, formats, {
      params: { music_file: musicFile, music_volume: musicVolume },
    }).then((r) => r.data),
  video: (episodeId: string, musicFile?: string, musicVolume = 0.12) =>
    api.post(`/export/${episodeId}/video`, null, {
      params: { music_file: musicFile, music_volume: musicVolume },
    }).then((r) => r.data),
  uploadCover: (episodeId: string, file: File, coverType = "cover") => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post(`/export/${episodeId}/cover?cover_type=${coverType}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  fileUrl: (episodeId: string, filename: string) => `/api/export/${episodeId}/file/${filename}`,
};

export const settingsApi = {
  get: () => api.get("/settings/").then((r) => r.data),
  update: (data: Record<string, unknown>) => api.put("/settings/", data).then((r) => r.data),
};

export const musicApi = {
  list: () => api.get("/music/").then((r) => r.data),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/music/upload", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  },
  delete: (filename: string) => api.delete(`/music/${filename}`).then((r) => r.data),
  fileUrl: (filename: string) => `/api/music/file/${filename}`,
};
