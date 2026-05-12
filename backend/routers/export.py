import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlmodel import Session
from pathlib import Path
from datetime import datetime
from typing import Annotated
from models import Episode, EpisodeStatus
from database import get_session
from config import EPISODES_DIR
from services.export_service import export_audio, AudioFormat
from services.video_service import generate_youtube_video

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/{episode_id}/audio")
def export_audio_route(
    episode_id: str,
    formats: list[AudioFormat],
    session: Session = Depends(get_session),
):
    episode = session.get(Episode, episode_id)
    if not episode or not episode.audio_path:
        raise HTTPException(status_code=404, detail="Audio introuvable")

    wav_path = Path(episode.audio_path)
    exports_dir = EPISODES_DIR / episode_id / "exports"
    results = []
    for fmt in formats:
        try:
            info = export_audio(wav_path, exports_dir, fmt)
            results.append(info)
        except Exception as e:
            results.append({"format": fmt, "error": str(e)})

    existing = episode.exports or []
    existing_formats = {e["format"] for e in existing}
    for r in results:
        if "error" not in r and r["format"] not in existing_formats:
            existing.append(r)
    episode.exports = existing
    episode.status = EpisodeStatus.exported
    episode.updated_at = datetime.utcnow()
    session.add(episode)
    session.commit()
    return results


@router.post("/{episode_id}/video")
def export_video_route(episode_id: str, session: Session = Depends(get_session)):
    episode = session.get(Episode, episode_id)
    if not episode or not episode.audio_path:
        raise HTTPException(status_code=404, detail="Audio introuvable")
    if not episode.cover_path:
        raise HTTPException(status_code=400, detail="Cover requise pour générer la vidéo")

    wav_path = Path(episode.audio_path)
    cover_path = Path(episode.cover_path)
    thumbnail_path = Path(episode.thumbnail_path) if episode.thumbnail_path else cover_path
    exports_dir = EPISODES_DIR / episode_id / "exports"

    try:
        info = generate_youtube_video(wav_path, cover_path, thumbnail_path, exports_dir)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    existing = episode.exports or []
    existing.append(info)
    episode.exports = existing
    episode.status = EpisodeStatus.exported
    episode.updated_at = datetime.utcnow()
    session.add(episode)
    session.commit()
    return info


@router.post("/{episode_id}/cover")
async def upload_cover(
    episode_id: str,
    file: Annotated[UploadFile, File()],
    cover_type: str = "cover",
    session: Session = Depends(get_session),
):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Épisode introuvable")

    episode_dir = EPISODES_DIR / episode_id
    episode_dir.mkdir(parents=True, exist_ok=True)

    filename = "thumbnail.png" if cover_type == "thumbnail" else "cover.png"
    dest = episode_dir / filename

    content = await file.read()
    dest.write_bytes(content)

    if cover_type == "thumbnail":
        episode.thumbnail_path = str(dest)
    else:
        episode.cover_path = str(dest)

    episode.updated_at = datetime.utcnow()
    session.add(episode)
    session.commit()
    return {"path": str(dest), "type": cover_type}


@router.get("/{episode_id}/file/{filename}")
def download_file(episode_id: str, filename: str):
    path = EPISODES_DIR / episode_id / filename
    if not path.exists():
        path = EPISODES_DIR / episode_id / "exports" / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    return FileResponse(str(path), filename=filename)
