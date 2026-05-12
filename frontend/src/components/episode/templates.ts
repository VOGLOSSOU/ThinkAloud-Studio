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

// ── SILENCE — noir pur, logo centré, titre Playfair blanc ─────────────────
async function buildSilence(canvas: Canvas, w: number, h: number, title: string) {
  canvas.backgroundColor = "#0A0A0A";

  const bg = new Rect({ width: w, height: h, fill: "#0A0A0A", selectable: false, evented: false });
  canvas.add(bg);
  canvas.sendObjectToBack(bg);

  const logo = await loadLogo();
  logo.scaleToWidth(w * 0.38);
  logo.set({ left: w / 2, top: h * 0.38, originX: "center", originY: "center" });
  canvas.add(logo);

  canvas.add(new FabricText(title || "Sans titre", {
    left: w / 2, top: h * 0.64,
    fontFamily: "Playfair Display", fontSize: w * 0.048,
    fill: "#FAFAFA", originX: "center", originY: "center",
    textAlign: "center", fontWeight: "400",
  }));

  canvas.add(new FabricText("THINKALOUD", {
    left: w / 2, top: h * 0.72,
    fontFamily: "DM Sans", fontSize: w * 0.018,
    fill: "#C8A96E", originX: "center", originY: "center",
    charSpacing: 350, fontWeight: "300",
  }));

  canvas.renderAll();
}

// ── LA QUESTION — grande question en italique, logo discret en bas ─────────
async function buildLaQuestion(canvas: Canvas, w: number, h: number, title: string) {
  canvas.backgroundColor = "#0A0A0A";

  const bg = new Rect({ width: w, height: h, fill: "#0A0A0A", selectable: false, evented: false });
  canvas.add(bg);
  canvas.sendObjectToBack(bg);

  canvas.add(new FabricText(title || "C'est quoi le péché ?", {
    left: w / 2, top: h * 0.46,
    fontFamily: "Playfair Display", fontSize: w * 0.068,
    fill: "#FAFAFA", originX: "center", originY: "center",
    textAlign: "center", fontStyle: "italic", fontWeight: "400",
    splitByGrapheme: false,
  }));

  const logo = await loadLogo();
  logo.scaleToWidth(w * 0.14);
  logo.set({ left: w / 2, top: h * 0.8, originX: "center", originY: "center", opacity: 0.85 });
  canvas.add(logo);

  canvas.add(new FabricText("THINKALOUD", {
    left: w / 2, top: h * 0.88,
    fontFamily: "DM Sans", fontSize: w * 0.016,
    fill: "#C8A96E", originX: "center", originY: "center",
    charSpacing: 350, fontWeight: "300",
  }));

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
    id: "la-question",
    label: "La Question",
    desc: "La grande question en italique. Logo discret en bas.",
    build: buildLaQuestion,
  },
];

// ── THUMBNAIL: Scène — titre italique centré, lignes or, logo discret ────────
async function buildThumbScene(canvas: Canvas, w: number, h: number, title: string) {
  canvas.backgroundColor = "#0A0A0A";

  const bg = new Rect({ width: w, height: h, fill: "#0A0A0A", selectable: false, evented: false });
  canvas.add(bg);
  canvas.sendObjectToBack(bg);

  // Lignes or décoratives
  canvas.add(new Rect({
    left: w * 0.05, top: h * 0.14,
    width: w * 0.9, height: 1,
    fill: "#C8A96E", opacity: 0.35, selectable: false,
  }));
  canvas.add(new Rect({
    left: w * 0.05, top: h * 0.86,
    width: w * 0.9, height: 1,
    fill: "#C8A96E", opacity: 0.35, selectable: false,
  }));

  canvas.add(new FabricText(title || "Sans titre", {
    left: w / 2, top: h * 0.44,
    fontFamily: "Playfair Display", fontSize: w * 0.062,
    fill: "#FAFAFA", originX: "center", originY: "center",
    textAlign: "center", fontStyle: "italic", fontWeight: "400",
    width: w * 0.84,
  }));

  canvas.add(new FabricText("THINKALOUD", {
    left: w / 2, top: h * 0.70,
    fontFamily: "DM Sans", fontSize: w * 0.014,
    fill: "#C8A96E", originX: "center", originY: "center",
    charSpacing: 350, fontWeight: "300",
  }));

  const logo = await loadLogo();
  logo.scaleToWidth(w * 0.07);
  logo.set({ left: w * 0.08, top: h * 0.82, originX: "center", originY: "center", opacity: 0.65 });
  canvas.add(logo);

  canvas.renderAll();
}

// ── THUMBNAIL: Direct — logo + titre bold centré, lisible en petit ──────────
async function buildThumbDirect(canvas: Canvas, w: number, h: number, title: string) {
  canvas.backgroundColor = "#0A0A0A";

  const bg = new Rect({ width: w, height: h, fill: "#0A0A0A", selectable: false, evented: false });
  canvas.add(bg);
  canvas.sendObjectToBack(bg);

  const logo = await loadLogo();
  logo.scaleToWidth(w * 0.11);
  logo.set({ left: w / 2, top: h * 0.29, originX: "center", originY: "center" });
  canvas.add(logo);

  canvas.add(new FabricText(title || "Sans titre", {
    left: w / 2, top: h * 0.55,
    fontFamily: "Playfair Display", fontSize: w * 0.054,
    fill: "#FAFAFA", originX: "center", originY: "center",
    textAlign: "center", fontWeight: "400",
    width: w * 0.80,
  }));

  canvas.add(new FabricText("THINKALOUD", {
    left: w / 2, top: h * 0.76,
    fontFamily: "DM Sans", fontSize: w * 0.013,
    fill: "#C8A96E", originX: "center", originY: "center",
    charSpacing: 350, fontWeight: "300",
  }));

  canvas.renderAll();
}

export const THUMBNAIL_TEMPLATES: Template[] = [
  {
    id: "thumb-scene",
    label: "Scène",
    desc: "Titre italique centré, lignes or. Impact visuel.",
    build: buildThumbScene,
  },
  {
    id: "thumb-direct",
    label: "Direct",
    desc: "Logo + titre centré. Lisible en miniature.",
    build: buildThumbDirect,
  },
];
