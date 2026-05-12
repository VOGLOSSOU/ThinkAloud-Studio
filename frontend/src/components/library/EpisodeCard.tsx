import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Episode } from "@/types";
import { episodesApi } from "@/api/client";
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
  const queryClient = useQueryClient();
  const status = STATUS_LABELS[episode.status] ?? STATUS_LABELS.draft;

  const deleteMutation = useMutation({
    mutationFn: () => episodesApi.delete(episode.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      toast.success("Épisode supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Supprimer "${episode.title}" ? Cette action est irréversible.`)) {
      deleteMutation.mutate();
    }
  }

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
          <img src="/logo.png" alt="ThinkAloud" className="w-full h-full object-cover opacity-40" />
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

      {/* Icône delete — visible au hover de la card */}
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200
          p-1.5 rounded text-gris-cendre hover:text-red-400 hover:bg-red-400/10
          disabled:opacity-30 flex-shrink-0"
        title="Supprimer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
