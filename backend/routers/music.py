from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from typing import Annotated
from config import MUSIC_DIR

router = APIRouter(prefix="/music", tags=["music"])

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"}


@router.get("/")
def list_tracks():
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    tracks = [
        {"filename": f.name, "size_bytes": f.stat().st_size}
        for f in sorted(MUSIC_DIR.iterdir())
        if f.suffix.lower() in ALLOWED_EXTENSIONS
    ]
    return tracks


@router.post("/upload")
async def upload_track(file: Annotated[UploadFile, File()]):
    suffix = "." + (file.filename or "").rsplit(".", 1)[-1].lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Format non supporté")
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    dest = MUSIC_DIR / file.filename
    dest.write_bytes(await file.read())
    return {"filename": dest.name, "size_bytes": dest.stat().st_size}


@router.delete("/{filename}")
def delete_track(filename: str):
    path = MUSIC_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    path.unlink()
    return {"deleted": filename}


@router.get("/file/{filename}")
def serve_track(filename: str):
    path = MUSIC_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    return FileResponse(str(path))
