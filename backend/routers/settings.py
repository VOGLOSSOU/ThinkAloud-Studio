import json
from fastapi import APIRouter
from pathlib import Path
from config import DATA_DIR

router = APIRouter(prefix="/settings", tags=["settings"])

SETTINGS_FILE = DATA_DIR / "settings.json"

DEFAULT_SETTINGS = {
    "audio": {
        "device_index": None,
        "sample_rate": 48000,
        "bit_depth": 24,
        "channels": 1,
    },
    "export": {
        "default_formats": ["mp3", "wav"],
        "video_crf": 23,
        "export_dir": str(DATA_DIR / "episodes"),
    },
    "ui": {
        "theme": "dark",
        "language": "fr",
    },
}


def load_settings() -> dict:
    if SETTINGS_FILE.exists():
        return json.loads(SETTINGS_FILE.read_text())
    return DEFAULT_SETTINGS.copy()


def save_settings(data: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SETTINGS_FILE.write_text(json.dumps(data, indent=2))


@router.get("/")
def get_settings():
    return load_settings()


@router.put("/")
def update_settings(data: dict):
    current = load_settings()
    for key, val in data.items():
        if isinstance(val, dict) and key in current:
            current[key].update(val)
        else:
            current[key] = val
    save_settings(current)
    return current
