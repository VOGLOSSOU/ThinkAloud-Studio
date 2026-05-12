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


def export_audio(
    wav_path: Path,
    exports_dir: Path,
    fmt: AudioFormat,
    music_path: Path | None = None,
    music_volume: float = 0.12,
) -> dict:
    if not wav_path.exists():
        raise FileNotFoundError(f"Fichier audio source introuvable : {wav_path}")

    exports_dir.mkdir(parents=True, exist_ok=True)
    spec = FFMPEG_FORMATS[fmt]
    out_path = exports_dir / f"audio.{spec['ext']}"

    use_music = music_path and music_path.exists()

    if use_music:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(wav_path),
            "-stream_loop", "-1", "-i", str(music_path),
            "-filter_complex",
            f"[1:a]volume={music_volume}[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=3[out]",
            "-map", "[out]",
        ]
    else:
        cmd = ["ffmpeg", "-y", "-i", str(wav_path)]

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
        "music": music_path.name if use_music else None,
        "exported_at": datetime.utcnow().isoformat(),
    }
