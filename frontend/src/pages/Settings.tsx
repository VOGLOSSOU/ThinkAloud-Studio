import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { settingsApi, recordingApi } from "@/api/client";
import type { AudioDevice } from "@/types";

export default function Settings() {
  const { data: settings, isLoading } = useQuery({ queryKey: ["settings"], queryFn: settingsApi.get });
  const { data: devices = [] } = useQuery<AudioDevice[]>({ queryKey: ["devices"], queryFn: recordingApi.devices });

  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => settingsApi.update(form),
    onSuccess: () => toast.success("Paramètres sauvegardés"),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  function updateAudio(key: string, value: unknown) {
    setForm((f) => ({ ...f, audio: { ...(f.audio as object), [key]: value } }));
  }
  function updateExport(key: string, value: unknown) {
    setForm((f) => ({ ...f, export: { ...(f.export as object), [key]: value } }));
  }

  const audio = (form.audio as Record<string, unknown>) ?? {};
  const exp = (form.export as Record<string, unknown>) ?? {};

  if (isLoading) return <div className="p-8 text-gris-cendre font-mono text-sm">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-playfair text-3xl text-blanc-brume mb-6">Paramètres</h1>

        <div className="space-y-6">
          <section className="card space-y-4">
            <h2 className="font-lora text-blanc-brume text-base border-b border-gris-studio pb-2">
              Configuration Audio
            </h2>

            <div>
              <label className="label">Microphone par défaut</label>
              <select
                className="input-field"
                value={(audio.device_index as number) ?? ""}
                onChange={(e) => updateAudio("device_index", e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">Détection automatique</option>
                {devices.map((d) => (
                  <option key={d.index} value={d.index}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Fréquence d'échantillonnage</label>
                <select
                  className="input-field"
                  value={(audio.sample_rate as number) ?? 48000}
                  onChange={(e) => updateAudio("sample_rate", Number(e.target.value))}
                >
                  <option value={44100}>44 100 Hz</option>
                  <option value={48000}>48 000 Hz (recommandé)</option>
                </select>
              </div>
              <div>
                <label className="label">Profondeur de bits</label>
                <select
                  className="input-field"
                  value={(audio.bit_depth as number) ?? 24}
                  onChange={(e) => updateAudio("bit_depth", Number(e.target.value))}
                >
                  <option value={16}>16-bit</option>
                  <option value={24}>24-bit (recommandé)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Canaux</label>
              <select
                className="input-field"
                value={(audio.channels as number) ?? 1}
                onChange={(e) => updateAudio("channels", Number(e.target.value))}
              >
                <option value={1}>Mono (recommandé pour la voix)</option>
                <option value={2}>Stéréo</option>
              </select>
            </div>
          </section>

          <section className="card space-y-4">
            <h2 className="font-lora text-blanc-brume text-base border-b border-gris-studio pb-2">
              Configuration Export
            </h2>

            <div>
              <label className="label">Qualité vidéo</label>
              <select
                className="input-field"
                value={(exp.video_crf as number) ?? 23}
                onChange={(e) => updateExport("video_crf", Number(e.target.value))}
              >
                <option value={28}>Rapide (CRF 28)</option>
                <option value={23}>Standard (CRF 23)</option>
                <option value={18}>Master (CRF 18)</option>
              </select>
            </div>

            <div>
              <label className="label">Dossier d'export</label>
              <input
                type="text"
                className="input-field font-mono text-xs"
                value={(exp.export_dir as string) ?? ""}
                onChange={(e) => updateExport("export_dir", e.target.value)}
              />
            </div>
          </section>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={14} />
            Sauvegarder
          </button>
        </div>
      </motion.div>
    </div>
  );
}
