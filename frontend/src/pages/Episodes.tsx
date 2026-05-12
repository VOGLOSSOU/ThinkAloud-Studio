import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useEpisodes } from "@/hooks/useEpisodes";
import { episodesApi } from "@/api/client";
import EpisodeCard from "@/components/library/EpisodeCard";
import type { EpisodeStatus } from "@/types";

const FILTERS: { label: string; value: EpisodeStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Brouillons", value: "draft" },
  { label: "Prêts", value: "ready" },
  { label: "Exportés", value: "exported" },
];

export default function Episodes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: episodes = [], isLoading } = useEpisodes();
  const [filter, setFilter] = useState<EpisodeStatus | "all">("all");
  const [search, setSearch] = useState("");

  const createMutation = useMutation({
    mutationFn: () => episodesApi.create("Sans titre"),
    onSuccess: (ep) => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      navigate(`/episodes/${ep.id}`);
    },
    onError: () => toast.error("Impossible de créer l'épisode"),
  });

  const filtered = episodes
    .filter((e) => filter === "all" || e.status === filter)
    .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 w-full">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-playfair text-3xl text-blanc-brume">Mes Épisodes</h1>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} />
            Nouvel Épisode
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-cendre" />
            <input
              type="text"
              placeholder="Rechercher par titre..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-gris-nuit border border-gris-studio rounded-card p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded text-xs font-dm transition-all duration-200 ${
                  filter === f.value
                    ? "bg-gris-studio text-blanc-brume"
                    : "text-gris-cendre hover:text-blanc-brume"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
            <img src="/logo.png" alt="ThinkAloud" className="w-14 h-14 rounded-full object-cover opacity-30" />
            <p className="text-gris-cendre font-dm text-sm">
              {search ? "Aucun épisode trouvé." : "Aucun épisode dans cette catégorie."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ep, i) => (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
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
