import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mic, Square, Pause, Play, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import WaveSurfer from "wavesurfer.js";
import { recordingApi } from "@/api/client";
import type { AudioDevice, Episode } from "@/types";
import clsx from "clsx";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface RecorderProps {
  episode: Episode;
  onRecorded: () => void;
}

export default function Recorder({ episode, onRecorded }: RecorderProps) {
  const queryClient = useQueryClient();
  const waveRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: devices = [] } = useQuery<AudioDevice[]>({
    queryKey: ["devices"],
    queryFn: recordingApi.devices,
  });

  useEffect(() => {
    if (episode.audio_path && waveRef.current) {
      wavesurfer.current?.destroy();
      wavesurfer.current = WaveSurfer.create({
        container: waveRef.current,
        waveColor: "#2E2E2E",
        progressColor: "#C8A96E",
        cursorColor: "#C8A96E",
        height: 64,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        interact: true,
      });
      wavesurfer.current.load(`/api/media/${episode.id}/master.wav`);
    }
    return () => {
      wavesurfer.current?.destroy();
    };
  }, [episode.audio_path, episode.id]);

  const startMutation = useMutation({
    mutationFn: () => recordingApi.start(episode.id, selectedDevice),
    onSuccess: () => {
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    },
    onError: () => toast.error("Impossible de démarrer l'enregistrement"),
  });

  const pauseMutation = useMutation({
    mutationFn: () => recordingApi.pause(),
    onSuccess: (data) => {
      setIsPaused(data.paused);
      if (data.paused) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      }
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => recordingApi.stop(episode.id),
    onSuccess: () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
      queryClient.invalidateQueries({ queryKey: ["episodes", episode.id] });
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      onRecorded();
      toast.success("Enregistrement sauvegardé");
    },
    onError: () => toast.error("Erreur lors de l'arrêt"),
  });

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Microphone</label>
        <select
          className="input-field"
          value={selectedDevice ?? ""}
          onChange={(e) => setSelectedDevice(e.target.value === "" ? undefined : Number(e.target.value))}
          disabled={isRecording}
        >
          <option value="">Détection automatique</option>
          {devices.map((d) => (
            <option key={d.index} value={d.index}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="card flex flex-col items-center gap-6 py-8">
        <motion.div
          className={clsx(
            "w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300",
            isRecording && !isPaused
              ? "bg-red-500/20 border-2 border-red-500"
              : "bg-gris-studio border-2 border-gris-cendre/30"
          )}
          animate={isRecording && !isPaused ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Mic size={28} className={isRecording && !isPaused ? "text-red-400" : "text-gris-cendre"} />
        </motion.div>

        {isRecording && (
          <span className="font-mono text-2xl text-blanc-brume tabular-nums">
            {formatTime(duration)}
          </span>
        )}

        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-white
                rounded-card font-dm font-medium transition-all duration-200 disabled:opacity-50"
            >
              <Mic size={16} />
              Enregistrer
            </button>
          ) : (
            <>
              <button
                onClick={() => pauseMutation.mutate()}
                disabled={pauseMutation.isPending}
                className="btn-ghost flex items-center gap-2"
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? "Reprendre" : "Pause"}
              </button>
              <button
                onClick={() => stopMutation.mutate()}
                disabled={stopMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-gris-studio hover:bg-gris-cendre/20
                  text-blanc-brume rounded-card font-dm font-medium transition-all duration-200"
              >
                <Square size={16} />
                Arrêter
              </button>
            </>
          )}
        </div>
      </div>

      {episode.audio_path && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <span className="label">Aperçu de l'enregistrement</span>
            <span className="font-mono text-xs text-gris-cendre">
              {episode.duration_sec ? formatTime(episode.duration_sec) : "--:--"}
            </span>
          </div>
          <div ref={waveRef} className="w-full" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => wavesurfer.current?.playPause()}
              className="btn-ghost flex items-center gap-2 text-xs"
            >
              <Play size={13} /> Lecture
            </button>
            <button
              onClick={() => startMutation.mutate()}
              disabled={isRecording || startMutation.isPending}
              className="btn-ghost flex items-center gap-2 text-xs text-gris-cendre"
            >
              <RotateCcw size={13} /> Re-enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
