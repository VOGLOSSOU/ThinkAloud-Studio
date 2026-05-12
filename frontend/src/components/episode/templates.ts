import { Canvas, FabricText, FabricImage, Rect } from "fabric";

export interface Template {
  id: string;
  label: string;
  desc: string;
  build: (canvas: Canvas, w: number, h: number, title: string) => Promise<void>;
}

async function loadLogo(): Promise<FabricImage> {
  return FabricImage.fromURL("/logo.png");
}

// ── SILENCE — noir pur, logo centré, titre Playfair blanc ──────────────────
async function buildSilence(canvas: Canvas, w: number, h: number, title: string) {
  canvas.backgroundColor = "#0A0A0A";

  const bg = new Rect({ width: w, height: h, fill: "#0A0A0A", selectable: false, evented: false });
  canvas.add(bg);
  canvas.sendObjectToBack(bg);

  const logo = await loadLogo();
  const logoSize = w * 0.38;
  logo.scaleToWidth(logoSize);
  logo.set({ left: w / 2, top: h * 0.38, originX: "center", originY: "center", opacity: 1 });
  canvas.add(logo);

  const titleText = new FabricText(title || "Sans titre", {
    left: w / 2,
    top: h * 0.64,
    fontFamily: "Playfair Display",
    fontSize: w * 0.048,
    fill: "#FAFAFA",
    originX: "center",
    originY: "center",
    textAlign: "center",
    fontWeight: "400",
  });
  canvas.add(titleText);

  const brand = new FabricText("THINKALOUD", {
    left: w / 2,
    top: h * 0.72,
    fontFamily: "DM Sans",
    fontSize: w * 0.018,
    fill: "#C8A96E",
    originX: "center",
    originY: "center",
    charSpacing: 350,
    fontWeight: "300",
  });
  canvas.add(brand);

  canvas.renderAll();
}

// ── SILENCE VIDE — logo seul, aucun texte ─────────────────────────────────
async function buildSilenceVide(canvas: Canvas, w: number, h: number, _title: string) {
  canvas.backgroundColor = "#0A0A0A";

  const bg = new Rect({ width: w, height: h, fill: "#0A0A0A", selectable: false, evented: false });
  canvas.add(bg);
  canvas.sendObjectToBack(bg);

  const logo = await loadLogo();
  const logoSize = w * 0.5;
  logo.scaleToWidth(logoSize);
  logo.set({ left: w / 2, top: h / 2, originX: "center", originY: "center", opacity: 1 });
  canvas.add(logo);

  canvas.renderAll();
}

// ── LA QUESTION — grande question en typo, logo petit en bas ─────────────
async function buildLaQuestion(canvas: Canvas, w: number, h: number, title: string) {
  canvas.backgroundColor = "#0A0A0A";

  const bg = new Rect({ width: w, height: h, fill: "#0A0A0A", selectable: false, evented: false });
  canvas.add(bg);
  canvas.sendObjectToBack(bg);

  // Ligne or fine au tiers supérieur
  const line = new Rect({
    left: w * 0.1,
    top: h * 0.32,
    width: w * 0.8,
    height: 2,
    fill: "#C8A96E",
    selectable: false,
    evented: false,
    opacity: 0.6,
  });
  canvas.add(line);

  const question = new FabricText(title || "C'est quoi le péché ?", {
    left: w / 2,
    top: h * 0.52,
    fontFamily: "Playfair Display",
    fontSize: w * 0.068,
    fill: "#FAFAFA",
    originX: "center",
    originY: "center",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "400",
    splitByGrapheme: false,
  });
  canvas.add(question);

  const logo = await loadLogo();
  const logoSize = w * 0.14;
  logo.scaleToWidth(logoSize);
  logo.set({ left: w / 2, top: h * 0.82, originX: "center", originY: "center", opacity: 0.85 });
  canvas.add(logo);

  const brand = new FabricText("THINKALOUD", {
    left: w / 2,
    top: h * 0.89,
    fontFamily: "DM Sans",
    fontSize: w * 0.016,
    fill: "#C8A96E",
    originX: "center",
    originY: "center",
    charSpacing: 350,
    fontWeight: "300",
  });
  canvas.add(brand);

  canvas.renderAll();
}

export const TEMPLATES: Template[] = [
  {
    id: "silence",
    label: "Silence",
    desc: "Logo centré, titre en dessous. Noir pur.",
    build: buildSilence,
  },
  {
    id: "silence-vide",
    label: "Silence Vide",
    desc: "Logo seul. Aucun texte. Maximum de sobriété.",
    build: buildSilenceVide,
  },
  {
    id: "la-question",
    label: "La Question",
    desc: "La grande question en italique. Logo discret en bas.",
    build: buildLaQuestion,
  },
];
