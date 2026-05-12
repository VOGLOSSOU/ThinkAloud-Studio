import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Canvas, FabricText, FabricImage } from "fabric";
import { Download, Upload, Type, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { exportApi } from "@/api/client";
import type { Episode } from "@/types";
import { TEMPLATES } from "./templates";

interface CoverEditorProps {
  episode: Episode;
  type: "cover" | "thumbnail";
}

const CANVAS_W = { cover: 400, thumbnail: 480 };
const CANVAS_H = { cover: 400, thumbnail: 270 };
const REAL_W   = { cover: 3000, thumbnail: 1280 };
const REAL_H   = { cover: 3000, thumbnail: 720 };

export default function CoverEditor({ episode, type }: CoverEditorProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const fabricRef   = useRef<Canvas | null>(null);
  const queryClient = useQueryClient();
  const [coverTitle, setCoverTitle]         = useState(episode.title);
  const [textInput, setTextInput]           = useState("");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // ── Init canvas vide ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_W[type],
      height: CANVAS_H[type],
      backgroundColor: "#0A0A0A",
    });
    fabricRef.current = canvas;

    // Applique "Silence" par défaut pour la cover, vide pour la miniature
    if (type === "cover") {
      applyTemplate("silence", canvas, coverTitle);
      setActiveTemplate("silence");
    }

    return () => { canvas.dispose(); };
  }, [episode.id, type]);

  // ── Applique un template ──────────────────────────────────────────────────
  async function applyTemplate(templateId: string, canvasOverride?: Canvas, titleOverride?: string) {
    const canvas = canvasOverride ?? fabricRef.current;
    if (!canvas) return;
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    canvas.clear();
    canvas.backgroundColor = "#0A0A0A";
    await tpl.build(canvas, CANVAS_W[type], CANVAS_H[type], titleOverride ?? coverTitle);
    setActiveTemplate(templateId);
  }

  // ── Recharge le template actif avec le nouveau titre de cover ────────────
  async function refreshCoverTitle() {
    if (!activeTemplate) return;
    await applyTemplate(activeTemplate);
    toast.success("Titre mis à jour sur la cover");
  }

  // ── Ajoute un texte libre ─────────────────────────────────────────────────
  function addText() {
    if (!fabricRef.current) return;
    const t = new FabricText(textInput || "Texte", {
      left: CANVAS_W[type] / 2,
      top: CANVAS_H[type] / 2,
      fontFamily: "Playfair Display",
      fontSize: 24,
      fill: "#FAFAFA",
      originX: "center",
      originY: "center",
    });
    fabricRef.current.add(t);
    fabricRef.current.setActiveObject(t);
    fabricRef.current.renderAll();
  }

  // ── Ajoute une image importée ─────────────────────────────────────────────
  function addImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;
    const url = URL.createObjectURL(file);
    FabricImage.fromURL(url).then((img) => {
      const scale = Math.min(CANVAS_W[type] / (img.width ?? 1), CANVAS_H[type] / (img.height ?? 1));
      img.scale(scale * 0.8);
      img.set({ left: CANVAS_W[type] / 2, top: CANVAS_H[type] / 2, originX: "center", originY: "center" });
      fabricRef.current!.add(img);
      fabricRef.current!.renderAll();
    });
  }

  // ── Sauvegarde (upload vers le backend) ──────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const canvas = fabricRef.current;
      if (!canvas) throw new Error("Canvas non disponible");
      const scaleX = REAL_W[type] / CANVAS_W[type];
      const dataUrl = canvas.toDataURL({ format: "png", multiplier: scaleX });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${type}.png`, { type: "image/png" });
      return exportApi.uploadCover(episode.id, file, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes", episode.id] });
      toast.success(`${type === "cover" ? "Cover" : "Miniature"} sauvegardée`);
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  function downloadPng() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const scaleX = REAL_W[type] / CANVAS_W[type];
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: scaleX });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${episode.id}_${type}.png`;
    a.click();
  }

  const sizeLabel = type === "cover" ? "3000 × 3000 px" : "1280 × 720 px";

  return (
    <div className="space-y-5">

      {/* ── Titre affiché sur la cover (indépendant du titre de l'épisode) ── */}
      {type === "cover" && (
        <div className="card space-y-2 border-or/20">
          <div className="flex items-center justify-between">
            <div>
              <label className="label mb-0">Titre sur la cover</label>
              <p className="text-xs text-gris-cendre mt-0.5">
                Indépendant du titre YouTube. Tu peux mettre la grande question de l'épisode ici.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              value={coverTitle}
              onChange={(e) => setCoverTitle(e.target.value)}
              placeholder="Ex : C'est quoi le péché ?"
              onKeyDown={(e) => e.key === "Enter" && refreshCoverTitle()}
            />
            <button
              onClick={refreshCoverTitle}
              disabled={!activeTemplate}
              className="btn-primary flex items-center gap-1.5 whitespace-nowrap"
              title="Mettre à jour la cover avec ce titre"
            >
              <RefreshCw size={13} />
              Mettre à jour
            </button>
          </div>
          {coverTitle !== episode.title && (
            <p className="text-xs text-or/70 font-mono">
              ≠ titre YouTube : "{episode.title}"
            </p>
          )}
        </div>
      )}

      {/* ── Sélecteur de templates (cover uniquement) ── */}
      {type === "cover" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-or" />
            <label className="label mb-0">Templates</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl.id)}
                className={clsx(
                  "flex flex-col items-start p-3 rounded-card border text-left transition-all duration-200",
                  activeTemplate === tpl.id
                    ? "border-or bg-or/10"
                    : "border-gris-studio bg-gris-nuit hover:border-gris-cendre/40"
                )}
              >
                <span className="font-lora text-xs text-blanc-brume">{tpl.label}</span>
                <span className="text-xs text-gris-cendre mt-0.5 leading-tight">{tpl.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Barre d'outils ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input-field w-44 text-sm"
            placeholder="Élément texte libre..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button onClick={addText} className="btn-ghost flex items-center gap-1 text-xs">
            <Type size={13} /> Ajouter au canvas
          </button>
        </div>
        <label className="btn-ghost flex items-center gap-1 text-xs cursor-pointer">
          <ImageIcon size={13} /> Importer image
          <input type="file" accept="image/*" className="hidden" onChange={addImage} />
        </label>
      </div>

      {/* ── Canvas ── */}
      <div className="space-y-1">
        <p className="font-mono text-xs text-gris-cendre">{sizeLabel} — exporté en haute résolution</p>
        <div
          className="border border-gris-studio rounded-card overflow-hidden"
          style={{ width: CANVAS_W[type], height: CANVAS_H[type] }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <Upload size={14} />
          {uploadMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button onClick={downloadPng} className="btn-ghost flex items-center gap-2">
          <Download size={14} />
          Télécharger PNG
        </button>
      </div>
    </div>
  );
}
