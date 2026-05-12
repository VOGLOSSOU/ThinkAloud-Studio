"""
Génère 3 pistes piano ambiantes pour ThinkAloud Studio.
Utilise uniquement numpy + soundfile (déjà dans requirements.txt).
Pentatonique majeure de Do — toujours harmonieux, jamais dissonant.
"""
import numpy as np
import soundfile as sf
from pathlib import Path

SAMPLE_RATE = 44100

# Do majeur pentatonique — C, E, G, A, B sur 3 octaves
PENTATONIC = [
    130.81, 164.81, 196.00, 220.00, 246.94,   # octave 3
    261.63, 329.63, 392.00, 440.00, 493.88,   # octave 4
    523.25, 659.25, 783.99, 880.00,            # octave 5
]


def piano_note(freq: float, duration: float, amplitude: float = 0.5) -> np.ndarray:
    """Synthèse d'une note piano : harmoniques + enveloppe ADSR exponentielle."""
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)

    # Fondamentale + harmoniques (profil piano)
    wave = (
        amplitude       * np.sin(2 * np.pi * freq * t) +
        amplitude * 0.5 * np.sin(2 * np.pi * freq * 2 * t) +
        amplitude * 0.25 * np.sin(2 * np.pi * freq * 3 * t) +
        amplitude * 0.08 * np.sin(2 * np.pi * freq * 4 * t)
    )

    # Enveloppe : attaque rapide (5ms) + déclin exponentiel (piano)
    n = len(t)
    attack = max(1, int(0.005 * SAMPLE_RATE))
    envelope = np.exp(-2.5 * np.linspace(0, 1, n))
    envelope[:attack] *= np.linspace(0, 1, attack) / envelope[:attack].clip(min=1e-9)
    envelope[:attack] = np.linspace(0, 1, attack)

    return wave * envelope


def add_reverb(signal: np.ndarray) -> np.ndarray:
    """Réverbération simple : deux échos atténués."""
    out = signal.copy()
    for delay_ms, gain in [(80, 0.28), (150, 0.14), (260, 0.07)]:
        delay = int(delay_ms / 1000 * SAMPLE_RATE)
        echo = np.zeros_like(signal)
        echo[delay:] = signal[:-delay] * gain
        out += echo
    return out


def generate_track(
    output_path: Path,
    duration_sec: int = 180,
    seed: int = 0,
    note_pool: list[float] | None = None,
    gap_range: tuple[float, float] = (0.4, 1.4),
    amp_range: tuple[float, float] = (0.10, 0.20),
    note_dur_range: tuple[float, float] = (1.5, 3.2),
):
    rng = np.random.default_rng(seed)
    pool = note_pool or PENTATONIC
    total = int(SAMPLE_RATE * duration_sec)
    track = np.zeros(total)

    t = 0.0
    while t < duration_sec - 4:
        freq = rng.choice(pool)
        dur = float(rng.uniform(*note_dur_range))
        amp = float(rng.uniform(*amp_range))
        note = piano_note(freq, min(dur, duration_sec - t), amp)
        s = int(t * SAMPLE_RATE)
        e = min(s + len(note), total)
        track[s:e] += note[: e - s]
        t += float(rng.uniform(*gap_range))

    track = add_reverb(track)

    # Normalisation + fade in/out 4 s
    peak = np.max(np.abs(track))
    if peak > 0:
        track /= peak
    track *= 0.72
    fade = int(4 * SAMPLE_RATE)
    track[:fade] *= np.linspace(0, 1, fade)
    track[-fade:] *= np.linspace(1, 0, fade)

    sf.write(str(output_path), track.astype(np.float32), SAMPLE_RATE)
    print(f"  ✓  {output_path.name}")


def generate_default_tracks(music_dir: Path):
    music_dir.mkdir(parents=True, exist_ok=True)

    tracks = [
        {
            "filename": "Sérénité.wav",
            "seed": 1,
            "note_pool": PENTATONIC[:10],   # registres 3 & 4 — doux, posé
            "gap_range": (0.6, 1.8),
            "amp_range": (0.08, 0.16),
            "note_dur_range": (2.0, 3.5),
        },
        {
            "filename": "Contemplation.wav",
            "seed": 7,
            "note_pool": PENTATONIC[:5] + PENTATONIC[5:10],  # graves + médiums
            "gap_range": (0.3, 1.0),
            "amp_range": (0.10, 0.20),
            "note_dur_range": (1.2, 2.5),
        },
        {
            "filename": "Profondeur.wav",
            "seed": 13,
            "note_pool": PENTATONIC[:7],    # registre grave — atmosphérique
            "gap_range": (0.8, 2.2),
            "amp_range": (0.07, 0.14),
            "note_dur_range": (2.5, 4.0),
        },
    ]

    for t in tracks:
        path = music_dir / t["filename"]
        if path.exists():
            print(f"  —  {t['filename']} déjà présente, ignorée.")
            continue
        generate_track(
            path,
            duration_sec=180,
            seed=t["seed"],
            note_pool=t["note_pool"],
            gap_range=t["gap_range"],
            amp_range=t["amp_range"],
            note_dur_range=t["note_dur_range"],
        )


if __name__ == "__main__":
    from config import MUSIC_DIR
    print("Génération des pistes piano ambiantes...")
    generate_default_tracks(MUSIC_DIR)
    print("Terminé.")
