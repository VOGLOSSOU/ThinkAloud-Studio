import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Mic } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useEpisodes } from "@/hooks/useEpisodes";
import { episodesApi } from "@/api/client";
import StatCard from "@/components/dashboard/StatCard";
import EpisodeCard from "@/components/library/EpisodeCard";

function formatTotalDuration(episodes: { duration_sec: number | null }[]) {
  const total = episodes.reduce((acc, e) => acc + (e.duration_sec ?? 0), 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: episodes = [], isLoading } = useEpisodes();

  const createMutation = useMutation({
    mutationFn: () => episodesApi.create("Sans titre"),
    onSuccess: (episode) => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      navigate(`/episodes/${episode.id}`);
    },
    onError: () => toast.error("Impossible de créer l'épisode"),
  });

  const published = episodes.filter((e) => e.status === "exported").length;
  const inProgress = episodes.filter((e) => e.status === "ready").length;
  const drafts = episodes.filter((e) => e.status === "draft").length;
  const recent = episodes.slice(0, 5);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-playfair text-3xl text-blanc-brume mb-1">Dashboard</h1>
        <p className="text-gris-cendre text-sm font-dm mb-8">Un espace de réflexion à voix haute.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Exportés" value={published} />
          <StatCard label="Prêts" value={inProgress} />
          <StatCard label="Brouillons" value={drafts} />
          <StatCard
            label="Durée totale"
            value={isLoading ? "—" : formatTotalDuration(episodes)}
            sub={`${episodes.length} épisode${episodes.length !== 1 ? "s" : ""}`}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-lora text-blanc-brume text-lg">Épisodes récents</h2>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} />
            Nouvel Épisode
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse bg-gris-nuit" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <Mic size={32} className="text-gris-studio mb-3" />
            <p className="text-gris-cendre font-dm text-sm">Aucun épisode pour l'instant.</p>
            <button
              onClick={() => createMutation.mutate()}
              className="btn-primary mt-4 flex items-center gap-2"
            >
              <Plus size={14} />
              Créer mon premier épisode
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((ep) => (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EpisodeCard episode={ep} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
