# Démarrage de ThinkAloud Studio

## Prérequis

Avant tout, assure-toi que ces outils sont installés sur ta machine :

- **Python 3.11+** — `python3 --version`
- **Node.js 20+** — `node --version`
- **ffmpeg** — `ffmpeg -version`

Si ffmpeg manque : `sudo apt install ffmpeg`

---

## 1. Installation (une seule fois)

Ouvre un terminal à la racine du projet et exécute :

```bash
chmod +x install.sh
./install.sh
```

Ce script va :
- Créer l'environnement Python (`backend/venv/`)
- Installer les dépendances Python (`requirements.txt`)
- Installer les dépendances Node.js (`frontend/node_modules/`)

---

## 2. Démarrer l'application

```bash
./start.sh
```

Puis ouvre ton navigateur sur :

```
http://localhost:5173
```

L'application démarre deux serveurs en parallèle :
- **Backend API** → `http://localhost:8000` (FastAPI + Python)
- **Frontend** → `http://localhost:5173` (React + Vite)

Les pistes piano ambiantes (**Sérénité**, **Contemplation**, **Profondeur**) sont générées automatiquement au premier démarrage dans `~/thinkaloud/music/`. Ça peut prendre quelques secondes la première fois.

---

## 3. Arrêter l'application

Dans le terminal où `start.sh` tourne :

```
Ctrl+C
```

Les deux serveurs s'arrêtent en même temps.

---

## Où sont stockées les données ?

Tout est local, dans `~/thinkaloud/` :

```
~/thinkaloud/
├── thinkaloud.db        → base de données des épisodes
├── music/               → pistes piano de fond
└── episodes/
    └── <id-episode>/
        ├── master.wav   → enregistrement brut (jamais modifié)
        ├── cover.png    → cover 3000×3000px
        ├── thumbnail.png
        └── exports/     → fichiers exportés (MP3, WAV, MP4...)
```

---

## En cas de problème

| Problème | Solution |
|---|---|
| Port 8000 déjà utilisé | `kill $(lsof -ti:8000)` puis relancer |
| Port 5173 déjà utilisé | `kill $(lsof -ti:5173)` puis relancer |
| Module Python manquant | `cd backend && source venv/bin/activate && pip install -r requirements.txt` |
| Modules Node manquants | `cd frontend && npm install` |
