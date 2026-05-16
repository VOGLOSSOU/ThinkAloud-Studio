import subprocess
from pathlib import Path
from datetime import datetime
from config import VIDEO_CRF


def generate_youtube_video(
    wav_path: Path,
    cover_path: Path,
    exports_dir: Path,
    music_path: Path | None = None,
    music_volume: float = 0.12,
) -> dict:
    if not wav_path.exists():
        raise FileNotFoundError(f"Audio introuvable : {wav_path}")
    if not cover_path.exists():
        raise FileNotFoundError(f"Cover introuvable : {cover_path}")

    exports_dir.mkdir(parents=True, exist_ok=True)
    out_path = exports_dir / "video.mp4"
    use_music = music_path and music_path.exists()

    if use_music:
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(cover_path),
            "-i", str(wav_path),
            "-stream_loop", "-1", "-i", str(music_path),
            "-filter_complex",
            f"[2:a]volume={music_volume}[music];[1:a][music]amix=inputs=2:duration=first:dropout_transition=3:normalize=0[audio]",
            "-map", "0:v", "-map", "[audio]",
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(cover_path),
            "-i", str(wav_path),
            "-map", "0:v", "-map", "1:a",
        ]

    cmd += [
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-crf", str(VIDEO_CRF),
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black",
        "-c:a", "aac",
        "-b:a", "256k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        "-movflags", "+faststart",
        str(out_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg erreur vidéo : {result.stderr}")

    return {
        "format": "mp4",
        "path": str(out_path),
        "size_bytes": out_path.stat().st_size,
        "music": music_path.name if use_music else None,
        "exported_at": datetime.utcnow().isoformat(),
    }
