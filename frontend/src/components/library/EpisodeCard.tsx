import { useNavigate } from "react-router-dom";
import { Clock, Mic } from "lucide-react";
import type { Episode } from "@/types";
import clsx from "clsx";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:    { label: "Brouillon",  color: "text-gris-cendre bg-gris-studio" },
  ready:    { label: "Prêt",       color: "text-bleu-nuit bg-bleu-nuit/10" },
  exported: { label: "Exporté",    color: "text-or bg-or/10" },
};

function formatDuration(sec: number | null) {
  if (!sec) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

interface EpisodeCardProps {
  episode: Episode;
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const navigate = useNavigate();
  const status = STATUS_LABELS[episode.status] ?? STATUS_LABELS.draft;

  return (
    <div
      className="card flex gap-3 cursor-pointer hover:border-gris-cendre/50 transition-all duration-200 group"
      onClick={() => navigate(`/episodes/${episode.id}`)}
    >
      <div className="w-14 h-14 rounded-card flex-shrink-0 bg-gris-studio flex items-center justify-center overflow-hidden">
        {episode.cover_path ? (
          <img
            src={`/api/media/${episode.id}/cover.png`}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <Mic size={20} className="text-gris-cendre" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-lora text-blanc-brume text-sm truncate group-hover:text-or transition-colors duration-200">
            {episode.title}
          </h3>
          <span className={clsx("text-xs px-2 py-0.5 rounded-full font-mono flex-shrink-0", status.color)}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-gris-cendre font-mono">
            <Clock size={11} />
            {formatDuration(episode.duration_sec)}
          </span>
          <span className="text-xs text-gris-cendre font-mono">{formatDate(episode.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
