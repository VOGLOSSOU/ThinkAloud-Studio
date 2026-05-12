from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from models import Episode, EpisodeCreate, EpisodeUpdate, EpisodeRead
from database import get_session
from config import EPISODES_DIR

router = APIRouter(prefix="/episodes", tags=["episodes"])


@router.get("/", response_model=list[EpisodeRead])
def list_episodes(session: Session = Depends(get_session)):
    episodes = session.exec(select(Episode).order_by(Episode.created_at.desc())).all()
    return episodes


@router.post("/", response_model=EpisodeRead)
def create_episode(data: EpisodeCreate, session: Session = Depends(get_session)):
    episode = Episode(title=data.title)
    session.add(episode)
    session.commit()
    session.refresh(episode)
    episode_dir = EPISODES_DIR / episode.id
    episode_dir.mkdir(parents=True, exist_ok=True)
    (episode_dir / "exports").mkdir(exist_ok=True)
    return episode


@router.get("/{episode_id}", response_model=EpisodeRead)
def get_episode(episode_id: str, session: Session = Depends(get_session)):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Épisode introuvable")
    return episode


@router.patch("/{episode_id}", response_model=EpisodeRead)
def update_episode(episode_id: str, data: EpisodeUpdate, session: Session = Depends(get_session)):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Épisode introuvable")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(episode, key, value)
    episode.updated_at = datetime.utcnow()
    session.add(episode)
    session.commit()
    session.refresh(episode)
    return episode


@router.delete("/{episode_id}")
def delete_episode(episode_id: str, session: Session = Depends(get_session)):
    episode = session.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Épisode introuvable")
    import shutil
    episode_dir = EPISODES_DIR / episode_id
    if episode_dir.exists():
        shutil.rmtree(episode_dir)
    session.delete(episode)
    session.commit()
    return {"ok": True}
