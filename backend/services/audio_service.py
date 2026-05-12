import threading
import numpy as np
import sounddevice as sd
import soundfile as sf
from pathlib import Path
from typing import Optional
from config import AUDIO_SAMPLE_RATE, AUDIO_BIT_DEPTH, AUDIO_CHANNELS

_recording_state: dict = {
    "active": False,
    "paused": False,
    "frames": [],
    "stream": None,
    "episode_id": None,
}


def list_devices() -> list[dict]:
    devices = sd.query_devices()
    result = []
    for i, d in enumerate(devices):
        if d["max_input_channels"] > 0:
            result.append({"index": i, "name": d["name"], "channels": d["max_input_channels"]})
    return result


def start_recording(episode_id: str, device_index: Optional[int] = None) -> dict:
    if _recording_state["active"]:
        raise RuntimeError("Un enregistrement est déjà en cours")

    _recording_state["frames"] = []
    _recording_state["active"] = True
    _recording_state["paused"] = False
    _recording_state["episode_id"] = episode_id

    def callback(indata, frames, time, status):
        if _recording_state["active"] and not _recording_state["paused"]:
            _recording_state["frames"].append(indata.copy())

    stream = sd.InputStream(
        samplerate=AUDIO_SAMPLE_RATE,
        channels=AUDIO_CHANNELS,
        dtype="float32",
        device=device_index,
        callback=callback,
        blocksize=1024,
    )
    stream.start()
    _recording_state["stream"] = stream
    return {"status": "recording", "episode_id": episode_id}


def pause_recording() -> dict:
    if not _recording_state["active"]:
        raise RuntimeError("Pas d'enregistrement actif")
    _recording_state["paused"] = not _recording_state["paused"]
    return {"paused": _recording_state["paused"]}


def stop_recording(output_path: Path) -> dict:
    if not _recording_state["active"]:
        raise RuntimeError("Pas d'enregistrement actif")

    stream = _recording_state["stream"]
    if stream:
        stream.stop()
        stream.close()

    frames = _recording_state["frames"]
    _recording_state["active"] = False
    _recording_state["paused"] = False
    _recording_state["stream"] = None
    _recording_state["frames"] = []
    _recording_state["episode_id"] = None

    if not frames:
        raise RuntimeError("Aucune donnée audio capturée")

    audio_data = np.concatenate(frames, axis=0)
    duration = len(audio_data) / AUDIO_SAMPLE_RATE

    output_path.parent.mkdir(parents=True, exist_ok=True)

    subtype = "PCM_24" if AUDIO_BIT_DEPTH == 24 else "PCM_16"
    sf.write(str(output_path), audio_data, AUDIO_SAMPLE_RATE, subtype=subtype)

    return {"path": str(output_path), "duration_sec": round(duration, 2)}


def get_recording_status() -> dict:
    frames = _recording_state["frames"]
    duration = (
        sum(len(f) for f in frames) / AUDIO_SAMPLE_RATE
        if frames
        else 0.0
    )
    return {
        "active": _recording_state["active"],
        "paused": _recording_state["paused"],
        "episode_id": _recording_state["episode_id"],
        "duration_sec": round(duration, 2),
    }
