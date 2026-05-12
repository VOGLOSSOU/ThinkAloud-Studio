import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Canvas, FabricText, FabricImage, Rect, Gradient } from "fabric";
import { Download, Upload, Type, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { exportApi } from "@/api/client";
import type { Episode } from "@/types";

const DEFAULT_BG = "#1A1A1A";
const COVER_SIZE = 3000;
const PREVIEW_SIZE = 400;
const SCALE = PREVIEW_SIZE / COVER_SIZE;

interface CoverEditorProps {
  episode: Episode;
  type: "cover" | "thumbnail";
}

const CANVAS_W = { cover: 400, thumbnail: 480 };
const CANVAS_H = { cover: 400, thumbnail: 270 };
const REAL_W = { cover: 3000, thumbnail: 1280 };
const REAL_H = { cover: 3000, thumbnail: 720 };

export default function CoverEditor({ episode, type }: CoverEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const queryClient = useQueryClient();
  const [textInput, setTextInput] = useState(
    type === "cover" ? episode.title : episode.title
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_W[type],
      height: CANVAS_H[type],
      backgroundColor: DEFAULT_BG,
    });
    fabricRef.current = canvas;

    const bg = new Rect({
      width: CANVAS_W[type],
      height: CANVAS_H[type],
      fill: DEFAULT_BG,
      selectable: false,
      evented: false,
    });
    canvas.add(bg);
    canvas.sendObjectToBack(bg);

    // Charge le logo comme élément de départ (déplaçable/redimensionnable)
    FabricImage.fromURL("/logo.png").then((img) => {
      if (type === "cover") {
        const logoSize = CANVAS_W[type] * 0.35;
        img.scaleToWidth(logoSize);
        img.set({
          left: CANVAS_W[type] / 2,
          top: CANVAS_H[type] * 0.35,
          originX: "center",
          originY: "center",
          opacity: 0.9,
        });
      } else {
        const logoSize = CANVAS_H[type] * 0.55;
        img.scaleToHeight(logoSize);
        img.set({
          left: CANVAS_W[type] * 0.12,
          top: CANVAS_H[type] / 2,
          originX: "center",
          originY: "center",
          opacity: 0.9,
        });
      }
      canvas.add(img);
      canvas.sendObjectToBack(img);
      canvas.sendObjectToBack(bg);
      canvas.renderAll();
    });

    const titleText = new FabricText(episode.title || "Sans titre", {
      left: CANVAS_W[type] / 2,
      top: type === "cover" ? CANVAS_H[type] * 0.7 : CANVAS_H[type] / 2,
      fontFamily: "Playfair Display",
      fontSize: type === "cover" ? 26 : 20,
      fill: "#FAFAFA",
      originX: "center",
      originY: "center",
      textAlign: "center",
    });
    canvas.add(titleText);

    const sub = new FabricText("THINKALOUD", {
      left: type === "cover" ? CANVAS_W[type] / 2 : CANVAS_W[type] * 0.62,
      top: type === "cover" ? CANVAS_H[type] * 0.7 + 36 : CANVAS_H[type] / 2 + 28,
      fontFamily: "DM Sans",
      fontSize: type === "cover" ? 10 : 9,
      fill: "#C8A96E",
      originX: "center",
      originY: "center",
      charSpacing: 250,
    });
    canvas.add(sub);

    canvas.renderAll();

    return () => {
      canvas.dispose();
    };
  }, [episode.id, type]);

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
      const realCanvas = document.createElement("canvas");
      realCanvas.width = REAL_W[type];
      realCanvas.height = REAL_H[type];
      const ctx = realCanvas.getContext("2d")!;
      const scaleX = REAL_W[type] / CANVAS_W[type];
      const scaleY = REAL_H[type] / CANVAS_H[type];
      ctx.scale(scaleX, scaleY);
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
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: REAL_W[type] / CANVAS_W[type] });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${episode.id}_${type}.png`;
    a.click();
  }

  const title = type === "cover" ? "Cover (3000×3000px)" : "Miniature YouTube (1280×720px)";

  return (
    <div className="space-y-4">
      <p className="text-xs text-gris-cendre font-mono">{title}</p>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input-field w-48 text-sm"
            placeholder="Texte à ajouter..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button onClick={addText} className="btn-ghost flex items-center gap-1 text-xs">
            <Type size={13} /> Ajouter
          </button>
        </div>
        <label className="btn-ghost flex items-center gap-1 text-xs cursor-pointer">
          <ImageIcon size={13} /> Image
          <input type="file" accept="image/*" className="hidden" onChange={addImage} />
        </label>
      </div>

      <div
        className="border border-gris-studio rounded-card overflow-hidden"
        style={{ width: CANVAS_W[type], height: CANVAS_H[type] }}
      >
        <canvas ref={canvasRef} />
      </div>

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
