import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useUpdateEpisode } from "@/hooks/useEpisodes";
import type { Episode } from "@/types";

interface MetadataProps {
  episode: Episode;
}

export default function Metadata({ episode }: MetadataProps) {
  const [title, setTitle] = useState(episode.title);
  const [description, setDescription] = useState(episode.description);
  const [hashtagInput, setHashtagInput] = useState(episode.hashtags.join(" "));
  const updateMutation = useUpdateEpisode();

  useEffect(() => {
    setTitle(episode.title);
    setDescription(episode.description);
    setHashtagInput(episode.hashtags.join(" "));
  }, [episode.id]);

  function parseHashtags(raw: string) {
    return raw
      .split(/[\s,]+/)
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .filter((t) => t.length > 1);
  }

  function save() {
    updateMutation.mutate(
      { id: episode.id, data: { title, description, hashtags: parseHashtags(hashtagInput) } },
      {
        onSuccess: () => toast.success("Métadonnées sauvegardées"),
        onError: () => toast.error("Erreur lors de la sauvegarde"),
      }
    );
  }

  function copyAll() {
    const tags = parseHashtags(hashtagInput).join(" ");
    const text = `${title}\n\n${description}\n\n${tags}`;
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label">Titre</label>
          <span className="font-mono text-xs text-gris-cendre">{title.length}/100</span>
        </div>
        <input
          type="text"
          className="input-field"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l'épisode..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label">Description</label>
          <span className="font-mono text-xs text-gris-cendre">{description.length}/5000</span>
        </div>
        <textarea
          className="input-field resize-none h-40"
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description YouTube de l'épisode..."
        />
      </div>

      <div>
        <label className="label">Hashtags</label>
        <input
          type="text"
          className="input-field font-mono text-sm"
          value={hashtagInput}
          onChange={(e) => setHashtagInput(e.target.value)}
          placeholder="#thinkaloud #réflexion #podcast..."
        />
        <p className="text-xs text-gris-cendre mt-1">
          Séparés par des espaces ou virgules. Le # est ajouté automatiquement.
        </p>
      </div>

      {parseHashtags(hashtagInput).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {parseHashtags(hashtagInput).map((t) => (
            <span key={t} className="px-2 py-1 bg-or/10 text-or text-xs font-mono rounded">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={updateMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={14} />
          Sauvegarder
        </button>
        <button onClick={copyAll} className="btn-ghost flex items-center gap-2">
          <Copy size={14} />
          Copier tout
        </button>
      </div>
    </div>
  );
}
