import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Video, Music, CheckCircle, AlertCircle, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { exportApi } from "@/api/client";
import type { Episode } from "@/types";

const AUDIO_FORMATS = [
  { id: "mp3",  label: "MP3",  detail: "320 kbps — universel" },
  { id: "wav",  label: "WAV",  detail: "48kHz 24-bit — master" },
  { id: "flac", label: "FLAC", detail: "Sans perte — archivage" },
  { id: "ogg",  label: "OGG",  detail: "Vorbis q10 — web/Android" },
  { id: "aac",  label: "AAC",  detail: "256 kbps — Apple/YouTube" },
  { id: "m4a",  label: "M4A",  detail: "256 kbps — iTunes/Podcasts" },
];

interface ExportPanelProps {
  episode: Episode;
}

export default function ExportPanel({ episode }: ExportPanelProps) {
  const queryClient = useQueryClient();
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["mp3", "wav"]);
  const [voiceProcessing, setVoiceProcessing] = useState(true);
  const exportedFormats = new Set((episode.exports ?? []).map((e) => e.format));

  const audioMutation = useMutation({
    mutationFn: () => exportApi.audio(episode.id, selectedFormats, voiceProcessing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episode.id] });
      toast.success("Export audio terminé");
    },
    onError: () => toast.error("Erreur lors de l'export audio"),
  });

  const videoMutation = useMutation({
    mutationFn: () => exportApi.video(episode.id, voiceProcessing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episode.id] });
      toast.success("Vidéo YouTube générée");
    },
    onError: (e: Error) => toast.error(e.message || "Erreur lors de la génération vidéo"),
  });

  function toggleFormat(id: string) {
    setSelectedFormats((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }

  const hasAudio = !!episode.audio_path;
  const hasCover = !!episode.cover_path;

  return (
    <div className="space-y-6">

      {/* ── Traitement voix ── */}
      <section className="card space-y-3">
        <button
          onClick={() => setVoiceProcessing((v) => !v)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Wand2 size={15} className={voiceProcessing ? "text-or" : "text-gris-cendre"} />
            <div className="text-left">
              <span className={`font-lora text-sm ${voiceProcessing ? "text-blanc-brume" : "text-gris-cendre"}`}>
                Traitement voix
              </span>
              <p className="text-xs text-gris-cendre mt-0.5">
                Compression · Présence · Normalisation -16 LUFS
              </p>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
            voiceProcessing ? "bg-or" : "bg-gris-studio"
          }`}>
            <div className={`w-4 h-4 rounded-full bg-blanc-brume shadow transition-transform duration-200 ${
              voiceProcessing ? "translate-x-5" : "translate-x-0"
            }`} />
          </div>
        </button>

        {voiceProcessing && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: "Highpass 80Hz",    desc: "Supprime les grondements" },
              { label: "Compression 3:1",  desc: "Pose et stabilise la voix" },
              { label: "Loudnorm −16 LUFS", desc: "Standard YouTube / Spotify" },
            ].map((step) => (
              <div key={step.label} className="bg-gris-studio/50 rounded-card p-2">
                <p className="font-mono text-xs text-or">{step.label}</p>
                <p className="text-xs text-gris-cendre mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <div className="flex items-center gap-2 border-b border-gris-studio pb-2">
          <Music size={16} className="text-or" />
          <h3 className="font-lora text-blanc-brume text-sm">Export Audio</h3>
        </div>

        {!hasAudio && (
          <div className="flex items-center gap-2 text-gris-cendre text-xs font-mono">
            <AlertCircle size={13} />
            Enregistrez d'abord un audio.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AUDIO_FORMATS.map((fmt) => {
            const isSelected = selectedFormats.includes(fmt.id);
            const isDone = exportedFormats.has(fmt.id);
            return (
              <button
                key={fmt.id}
                onClick={() => toggleFormat(fmt.id)}
                className={`flex flex-col items-start p-3 rounded-card border text-left transition-all duration-200 ${
                  isSelected
                    ? "border-or bg-or/10"
                    : "border-gris-studio bg-gris-nuit hover:border-gris-cendre/50"
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-mono text-xs font-medium text-blanc-brume">{fmt.label}</span>
                  {isDone && <CheckCircle size={11} className="text-or ml-auto" />}
                </div>
                <span className="text-xs text-gris-cendre mt-0.5">{fmt.detail}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => audioMutation.mutate()}
          disabled={!hasAudio || selectedFormats.length === 0 || audioMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={14} />
          {audioMutation.isPending ? "Export en cours..." : `Exporter (${selectedFormats.length} format${selectedFormats.length !== 1 ? "s" : ""})`}
        </button>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center gap-2 border-b border-gris-studio pb-2">
          <Video size={16} className="text-or" />
          <h3 className="font-lora text-blanc-brume text-sm">Vidéo YouTube</h3>
        </div>

        <div className="space-y-2 text-sm font-dm">
          <div className="flex items-center gap-2">
            {hasAudio ? (
              <CheckCircle size={14} className="text-or" />
            ) : (
              <AlertCircle size={14} className="text-gris-cendre" />
            )}
            <span className={hasAudio ? "text-blanc-brume" : "text-gris-cendre"}>Audio enregistré</span>
          </div>
          <div className="flex items-center gap-2">
            {hasCover ? (
              <CheckCircle size={14} className="text-or" />
            ) : (
              <AlertCircle size={14} className="text-gris-cendre" />
            )}
            <span className={hasCover ? "text-blanc-brume" : "text-gris-cendre"}>Cover créée</span>
          </div>
        </div>

        <p className="text-xs text-gris-cendre font-mono">
          Format : MP4 H.264 — 1920×1080px — AAC 256kbps
        </p>

        {exportedFormats.has("mp4") && (
          <a
            href={exportApi.fileUrl(episode.id, "video.mp4")}
            download
            className="btn-ghost flex items-center gap-2 w-fit text-xs"
          >
            <Download size={13} />
            Re-télécharger la vidéo
          </a>
        )}

        <button
          onClick={() => videoMutation.mutate()}
          disabled={!hasAudio || !hasCover || videoMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <Video size={14} />
          {videoMutation.isPending ? "Génération en cours..." : "Générer la vidéo YouTube"}
        </button>

        {videoMutation.isPending && (
          <motion.div
            className="w-full h-1 bg-gris-studio rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-or rounded-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              style={{ width: "40%" }}
            />
          </motion.div>
        )}
      </section>

      {episode.exports.length > 0 && (
        <section className="card space-y-3">
          <h3 className="font-lora text-blanc-brume text-sm border-b border-gris-studio pb-2">
            Exports réalisés
          </h3>
          <div className="space-y-2">
            {episode.exports.map((exp, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-or uppercase bg-or/10 px-2 py-0.5 rounded">
                    {exp.format}
                  </span>
                  <span className="text-xs text-gris-cendre font-mono">
                    {(exp.size_bytes / 1_000_000).toFixed(1)} Mo
                  </span>
                </div>
                <a
                  href={exportApi.fileUrl(episode.id, `audio.${exp.format}`)}
                  download
                  className="text-xs text-bleu-nuit hover:text-blanc-brume transition-colors font-mono flex items-center gap-1"
                >
                  <Download size={11} />
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
