import subprocess
from pathlib import Path
from datetime import datetime
from typing import Literal

AudioFormat = Literal["mp3", "wav", "flac", "ogg", "aac", "m4a"]

FFMPEG_FORMATS: dict[AudioFormat, dict] = {
    "mp3":  {"ext": "mp3",  "codec": "libmp3lame", "bitrate": "320k"},
    "wav":  {"ext": "wav",  "codec": "pcm_s24le",  "bitrate": None},
    "flac": {"ext": "flac", "codec": "flac",       "bitrate": None},
    "ogg":  {"ext": "ogg",  "codec": "libvorbis",  "quality": "10"},
    "aac":  {"ext": "aac",  "codec": "aac",        "bitrate": "256k"},
    "m4a":  {"ext": "m4a",  "codec": "aac",        "bitrate": "256k"},
}

# Pipeline de traitement voix — reproduit le son "studio" d'iOS
# 1. highpass=80Hz    → supprime les grondements basses fréquences
# 2. lowpass=16kHz    → retire les artefacts ultrasoniques inutiles
# 3. acompressor      → compression douce (ratio 3:1) qui pose la voix
# 4. equalizer 3kHz   → +2dB de présence — la voix ressort clairement
# 5. loudnorm -16LUFS → normalisation EBU R128 (standard YouTube/Spotify)
VOICE_FILTER = (
    "highpass=f=80,"
    "lowpass=f=16000,"
    "acompressor=threshold=0.125:ratio=3:attack=5:release=50:makeup=1.26,"
    "equalizer=f=3000:width_type=o:width=2:g=2,"
    "loudnorm=I=-16:TP=-1.5:LRA=11"
)


def export_audio(
    wav_path: Path,
    exports_dir: Path,
    fmt: AudioFormat,
    voice_processing: bool = True,
) -> dict:
    if not wav_path.exists():
        raise FileNotFoundError(f"Fichier audio source introuvable : {wav_path}")

    exports_dir.mkdir(parents=True, exist_ok=True)
    spec = FFMPEG_FORMATS[fmt]
    out_path = exports_dir / f"audio.{spec['ext']}"

    cmd = ["ffmpeg", "-y", "-i", str(wav_path)]

    if voice_processing:
        cmd += ["-af", VOICE_FILTER]

    if spec.get("bitrate"):
        cmd += ["-c:a", spec["codec"], "-b:a", spec["bitrate"]]
    elif fmt == "ogg":
        cmd += ["-c:a", spec["codec"], "-q:a", spec["quality"]]
    else:
        cmd += ["-c:a", spec["codec"]]

    cmd.append(str(out_path))

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg erreur : {result.stderr}")

    return {
        "format": fmt,
        "path": str(out_path),
        "size_bytes": out_path.stat().st_size,
        "voice_processing": voice_processing,
        "exported_at": datetime.utcnow().isoformat(),
    }
