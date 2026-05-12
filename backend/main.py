from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import create_db
from routers import episodes, recording, export, settings, music
from config import EPISODES_DIR, MUSIC_DIR, ensure_dirs

def _seed_music():
    from generate_music import generate_default_tracks
    try:
        generate_default_tracks(MUSIC_DIR)
    except Exception as e:
        print(f"[music] Génération ignorée : {e}")

app = FastAPI(title="ThinkAloud Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(episodes.router)
app.include_router(recording.router)
app.include_router(export.router)
app.include_router(settings.router)
app.include_router(music.router)

app.mount("/media", StaticFiles(directory=str(EPISODES_DIR)), name="media")


@app.on_event("startup")
def on_startup():
    ensure_dirs()
    create_db()
    _seed_music()


@app.get("/health")
def health():
    return {"status": "ok", "app": "ThinkAloud Studio"}
