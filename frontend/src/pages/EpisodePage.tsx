import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, FileText, Image, Maximize, Download, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import clsx from "clsx";
import { useEpisode } from "@/hooks/useEpisodes";
import { episodesApi } from "@/api/client";
import Recorder from "@/components/episode/Recorder";
import Metadata from "@/components/episode/Metadata";
import CoverEditor from "@/components/episode/CoverEditor";
import ExportPanel from "@/components/episode/ExportPanel";
import type { EpisodeTab } from "@/types";
import { useState } from "react";

const TABS: { id: EpisodeTab; label: string; icon: typeof Mic }[] = [
  { id: "recording",  label: "Enregistrement", icon: Mic },
  { id: "metadata",   label: "Informations",   icon: FileText },
  { id: "cover",      label: "Cover",           icon: Image },
  { id: "thumbnail",  label: "Miniature",       icon: Maximize },
  { id: "export",     label: "Export",          icon: Download },
];

export default function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: episode, isLoading } = useEpisode(id);
  const [tab, setTab] = useState<EpisodeTab>("recording");

  const deleteMutation = useMutation({
    mutationFn: () => episodesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      navigate("/episodes");
      toast.success("Épisode supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-or border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="p-8">
        <p className="text-gris-cendre font-mono">Épisode introuvable.</p>
        <button onClick={() => navigate(-1)} className="btn-ghost mt-4 flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
      </div>
    );
  }

  const STATUS_COLORS = {
    draft: "text-gris-cendre",
    ready: "text-bleu-nuit",
    exported: "text-or",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gris-studio flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-gris-cendre hover:text-blanc-brume transition-colors">
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-lora text-blanc-brume text-lg truncate">{episode.title}</h1>
          <div className="flex items-center gap-3">
            <span className={clsx("font-mono text-xs capitalize", STATUS_COLORS[episode.status])}>
              {episode.status}
            </span>
            {episode.duration_sec && (
              <span className="font-mono text-xs text-gris-cendre">
                {Math.floor(episode.duration_sec / 60)}:{String(Math.floor(episode.duration_sec % 60)).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Supprimer cet épisode ? Cette action est irréversible.")) {
              deleteMutation.mutate();
            }
          }}
          className="text-gris-cendre hover:text-red-400 transition-colors p-1"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-0 border-b border-gris-studio px-6 flex-shrink-0 overflow-x-auto">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 text-sm font-dm transition-all duration-200 whitespace-nowrap",
              tab === tabId ? "tab-active" : "tab-inactive"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="max-w-2xl"
        >
          {tab === "recording" && (
            <Recorder episode={episode} onRecorded={() => setTab("metadata")} />
          )}
          {tab === "metadata" && <Metadata episode={episode} />}
          {tab === "cover" && <CoverEditor episode={episode} type="cover" />}
          {tab === "thumbnail" && <CoverEditor episode={episode} type="thumbnail" />}
          {tab === "export" && <ExportPanel episode={episode} />}
        </motion.div>
      </div>
    </div>
  );
}
