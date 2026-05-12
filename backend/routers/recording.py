from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pathlib import Path
from datetime import datetime
from models import Episode, EpisodeStatus
from database import get_session
from config import EPISODES_DIR
from services import audio_service

router = APIRouter(prefix="/recording", tags=["recording"])


@router.get("/devices")
def get_devices():
    return audio_service.list_devices()


@router.get("/status")
def recording_status():
    return audio_service.get_recording_status()


@router.post("/start/{episode_id}")
def start(episode_id: str, device_index: int | None = None, session: Session = Depends(get_session)):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Épisode introuvable")
    try:
        result = audio_service.start_recording(episode_id, device_index)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/pause")
def pause():
    try:
        return audio_service.pause_recording()
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/stop/{episode_id}")
def stop(episode_id: str, session: Session = Depends(get_session)):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Épisode introuvable")
    try:
        wav_path = EPISODES_DIR / episode_id / "master.wav"
        result = audio_service.stop_recording(wav_path)
        episode.audio_path = result["path"]
        episode.duration_sec = result["duration_sec"]
        episode.status = EpisodeStatus.ready
        episode.updated_at = datetime.utcnow()
        session.add(episode)
        session.commit()
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))
