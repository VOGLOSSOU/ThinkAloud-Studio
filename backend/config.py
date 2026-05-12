import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = Path(os.getenv("THINKALOUD_DATA_DIR", "~/thinkaloud")).expanduser()
EPISODES_DIR = DATA_DIR / "episodes"
TEMPLATES_DIR = DATA_DIR / "templates"
DB_PATH = DATA_DIR / "thinkaloud.db"

AUDIO_SAMPLE_RATE = int(os.getenv("AUDIO_SAMPLE_RATE", "48000"))
AUDIO_BIT_DEPTH = int(os.getenv("AUDIO_BIT_DEPTH", "24"))
AUDIO_CHANNELS = int(os.getenv("AUDIO_CHANNELS", "1"))
VIDEO_CRF = int(os.getenv("VIDEO_CRF", "23"))

def ensure_dirs():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    EPISODES_DIR.mkdir(parents=True, exist_ok=True)
    TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
