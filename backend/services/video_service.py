import subprocess
from pathlib import Path
from datetime import datetime
from config import VIDEO_CRF


def generate_youtube_video(
    wav_path: Path,
    cover_path: Path,
    thumbnail_path: Path,
    exports_dir: Path,
) -> dict:
    if not wav_path.exists():
        raise FileNotFoundError(f"Audio introuvable : {wav_path}")
    if not cover_path.exists():
        raise FileNotFoundError(f"Cover introuvable : {cover_path}")

    exports_dir.mkdir(parents=True, exist_ok=True)
    out_path = exports_dir / "video.mp4"

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", str(cover_path),
        "-i", str(wav_path),
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-crf", str(VIDEO_CRF),
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black",
        "-c:a", "aac",
        "-b:a", "256k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        "-movflags", "+faststart",
    ]

    if thumbnail_path.exists():
        cmd += ["-attach", str(thumbnail_path), "-metadata:s:t", "mimetype=image/png"]

    cmd.append(str(out_path))

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg erreur vidéo : {result.stderr}")

    return {
        "format": "mp4",
        "path": str(out_path),
        "size_bytes": out_path.stat().st_size,
        "exported_at": datetime.utcnow().isoformat(),
    }
