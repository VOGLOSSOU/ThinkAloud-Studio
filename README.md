# THINKALOUD STUDIO

> *"La voix d'abord. Toujours."*

Studio de production audio local pour la chaîne YouTube/podcast **ThinkAloud** — un espace de réflexion à voix haute.

---

## Ce que c'est

ThinkAloud Studio est une application web locale qui couvre l'intégralité du pipeline de production audio, de l'enregistrement brut jusqu'à la vidéo YouTube prête à publier. Elle tourne entièrement sur ta machine, sans connexion internet, sans compte, sans abonnement.

Elle remplace en un seul outil :
- Audacity (enregistrement audio)
- Canva / Photoshop (création de cover)
- ffmpeg en ligne de commande (conversion + génération vidéo)
- Un gestionnaire de notes (titres, descriptions, hashtags)
- Handbrake (conversion multi-formats)

---

## Stack technique

| Côté | Technologie |
|------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | Zustand, React Query |
| Audio UI | Wavesurfer.js |
| Éditeur cover | Fabric.js |
| Backend | Python 3.11+, FastAPI |
| Audio capture | sounddevice (ALSA/PulseAudio) |
| Conversion | ffmpeg 6+ |
| Base de données | SQLite via SQLModel |
| OS cible | Linux Ubuntu 22.04 LTS+ |

---

## Prérequis

Avant d'installer, vérifie que ces outils sont présents sur ta machine :

```bash
python3 --version   # 3.11+
node --version      # 20 LTS+
npm --version
ffmpeg -version     # 6+
```

Si ffmpeg n'est pas installé :
```bash
sudo apt install ffmpeg
```

---

## Installation

```bash
git clone <url-du-repo> ThinkAloudApp
cd ThinkAloudApp
./install.sh
```

Le script `install.sh` :
1. Vérifie les dépendances système
2. Crée l'environnement virtuel Python (`backend/venv/`)
3. Installe les packages Python (`requirements.txt`)
4. Installe les dépendances Node.js (`npm install`)
5. Crée le fichier `backend/.env` depuis `.env.example`

---

## Démarrage

```bash
./start.sh
```

Puis ouvre ton navigateur sur **http://localhost:5173**

Le script lance en parallèle :
- Le backend FastAPI sur `http://localhost:8000`
- Le frontend Vite sur `http://localhost:5173`

Arrêt : `Ctrl+C`

---

## Flux de production (10 étapes)

```
01. Créer un épisode      → Bouton "Nouvel Épisode"
02. Sélectionner le micro → Choix du périphérique d'entrée
03. Enregistrer           → Bouton rouge — waveform live
04. Stop et écoute        → Sauvegarde WAV 48kHz 24-bit
05. Métadonnées           → Titre, description YouTube, hashtags
06. Cover                 → Éditeur canvas 3000×3000px
07. Miniature             → Éditeur canvas 1280×720px (16:9)
08. Export audio          → MP3, WAV, FLAC, OGG, AAC, M4A
09. Vidéo YouTube         → MP4 1080p H.264 via ffmpeg
10. Publier               → Copier titre/description/hashtags → YouTube Studio
```

---

## Structure du projet

```
ThinkAloudApp/
├── backend/
│   ├── main.py                  # Point d'entrée FastAPI
│   ├── models.py                # Modèle Episode (SQLite)
│   ├── database.py              # Connexion SQLite
│   ├── config.py                # Variables d'environnement
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── episodes.py          # CRUD épisodes
│   │   ├── recording.py         # Démarrer / pause / stop
│   │   ├── export.py            # Audio, vidéo, upload cover
│   │   └── settings.py         # Config de l'app
│   └── services/
│       ├── audio_service.py     # Capture micro (sounddevice)
│       ├── export_service.py    # Conversion audio (ffmpeg)
│       └── video_service.py     # Génération vidéo (ffmpeg)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── api/client.ts        # Appels API axios
│       ├── store/index.ts       # State global (Zustand)
│       ├── types/index.ts       # Types TypeScript
│       ├── hooks/useEpisodes.ts # React Query hooks
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── Episodes.tsx
│       │   ├── EpisodePage.tsx  # Éditeur principal (5 onglets)
│       │   └── Settings.tsx
│       └── components/
│           ├── layout/          # Sidebar, Layout
│           ├── dashboard/       # StatCard
│           ├── library/         # EpisodeCard
│           └── episode/
│               ├── Recorder.tsx     # Enregistrement + waveform
│               ├── Metadata.tsx     # Titre, description, hashtags
│               ├── CoverEditor.tsx  # Éditeur Fabric.js
│               └── ExportPanel.tsx  # Export audio + vidéo
│
├── install.sh
├── start.sh
└── README.md
```

---

## Données stockées

Tous les fichiers sont sauvegardés dans `~/thinkaloud/` :

```
~/thinkaloud/
├── episodes/
│   └── {uuid-episode}/
│       ├── master.wav          # Enregistrement brut (WAV 48kHz 24-bit)
│       ├── cover.png           # Cover carrée 3000×3000px
│       ├── cover.webp
│       ├── thumbnail.png       # Miniature YouTube 1280×720px
│       ├── exports/
│       │   ├── audio.mp3
│       │   ├── audio.flac
│       │   ├── audio.ogg
│       │   ├── audio.m4a
│       │   └── video.mp4
│       └── metadata.json
├── templates/
│   └── default-cover.json
├── settings.json
└── thinkaloud.db               # Base SQLite
```

---

## Formats d'export audio

| Format | Qualité | Usage |
|--------|---------|-------|
| MP3 | 320 kbps | Universel — streaming, téléchargement |
| WAV | 48kHz 24-bit | Master — archivage, ré-édition |
| FLAC | Sans perte | Bandcamp, archivage audiophile |
| OGG | Vorbis q10 | Android, Linux, web |
| AAC | 256 kbps | Apple Music, YouTube Music |
| M4A | 256 kbps | Apple Podcasts, iTunes |

---

## Identité visuelle

L'interface applique l'esthétique ThinkAloud : dark, minimaliste, sobre, presque méditative.

| Nom | Hex | Usage |
|-----|-----|-------|
| Noir Profond | `#0A0A0A` | Fond principal |
| Gris Nuit | `#1A1A1A` | Cards, panneaux |
| Gris Studio | `#2E2E2E` | Bordures, séparateurs |
| Or Chaud | `#C8A96E` | Accents, CTA, numéros |
| Bleu Nuit | `#6E8FC8` | Liens, accents secondaires |
| Blanc Brume | `#FAFAFA` | Textes principaux |
| Gris Cendre | `#9A9A9A` | Textes secondaires |

Polices : **Playfair Display** (titres) · **Lora** (épisodes) · **DM Sans** (UI) · **JetBrains Mono** (données)

---

## Configuration

Le fichier `backend/.env` (créé automatiquement depuis `.env.example`) :

```env
THINKALOUD_DATA_DIR=~/thinkaloud   # Dossier de stockage des données
AUDIO_SAMPLE_RATE=48000             # 44100 ou 48000 Hz
AUDIO_BIT_DEPTH=24                  # 16 ou 24-bit
AUDIO_CHANNELS=1                    # 1 = Mono (recommandé voix)
VIDEO_CRF=23                        # Qualité vidéo : 18 (master) / 23 (standard) / 28 (rapide)
```

---

## API Backend

La documentation interactive est disponible sur **http://localhost:8000/docs** quand l'app est lancée.

Endpoints principaux :

```
GET    /episodes/                      → Liste tous les épisodes
POST   /episodes/                      → Crée un épisode
PATCH  /episodes/{id}                  → Met à jour titre/description/hashtags
DELETE /episodes/{id}                  → Supprime l'épisode et ses fichiers

GET    /recording/devices              → Liste les micros disponibles
POST   /recording/start/{id}           → Démarre l'enregistrement
POST   /recording/pause                → Pause / Reprend
POST   /recording/stop/{id}            → Arrête et sauvegarde

POST   /export/{id}/audio              → Exporte en un ou plusieurs formats audio
POST   /export/{id}/video              → Génère la vidéo YouTube (MP4 1080p)
POST   /export/{id}/cover              → Upload la cover ou la miniature

GET    /settings/                      → Lit la configuration
PUT    /settings/                      → Sauvegarde la configuration
```

---

## Évolutions prévues (V2+)

- Réduction de bruit automatique (RNNoise / DeepFilterNet)
- Normalisation du volume (loudnorm EBU R128)
- Transcription automatique locale (Whisper)
- Génération de description via IA locale (Ollama)
- Chapitres YouTube (timestamps automatiques)
- Export Spotify Podcasts / Apple Podcasts
- Sauvegarde cloud optionnelle (Nextcloud, Google Drive)

---

*ThinkAloud n'est pas une chaîne de motivation. C'est un espace de réflexion.*
