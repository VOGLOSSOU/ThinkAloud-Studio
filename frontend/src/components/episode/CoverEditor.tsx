import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Canvas, FabricImage } from "fabric";
import { Download, Upload, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
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

export default function CoverEditor({ episode, type }: CoverEditorProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const fabricRef    = useRef<Canvas | null>(null);
  const queryClient  = useQueryClient();
  const [coverTitle, setCoverTitle]           = useState(episode.title);
  const [activeTemplate, setActiveTemplate]   = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_W[type],
      height: CANVAS_H[type],
      backgroundColor: "#0A0A0A",
    });
    fabricRef.current = canvas;

    if (type === "cover") {
      applyTemplate("silence", canvas, coverTitle);
      setActiveTemplate("silence");
    }

    return () => { canvas.dispose(); };
  }, [episode.id, type]);

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

  async function refreshCoverTitle() {
    if (!activeTemplate) return;
    await applyTemplate(activeTemplate);
    toast.success("Titre mis à jour sur la cover");
  }

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

      {/* ── Titre sur la cover ── */}
      {type === "cover" && (
        <div className="card space-y-2 border-or/20">
          <div>
            <label className="label mb-0">Titre sur la cover</label>
            <p className="text-xs text-gris-cendre mt-0.5">
              Indépendant du titre YouTube.
            </p>
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
            >
              <RefreshCw size={13} />
              Mettre à jour
            </button>
          </div>
          {coverTitle !== episode.title && (
            <p className="text-xs text-or/70 font-mono">≠ titre YouTube : "{episode.title}"</p>
          )}
        </div>
      )}

      {/* ── Sélecteur de templates ── */}
      {type === "cover" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-or" />
            <label className="label mb-0">Templates</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
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

      {/* ── Canvas ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-gris-cendre">{sizeLabel}</p>
          <label className="btn-ghost flex items-center gap-1 text-xs cursor-pointer">
            <ImageIcon size={13} /> Fond photo
            <input type="file" accept="image/*" className="hidden" onChange={addImage} />
          </label>
        </div>
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
