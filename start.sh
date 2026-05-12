#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo ""
  echo -e "${CYAN}Arrêt de ThinkAloud Studio...${NC}"
  kill "$BACKEND_PID" 2>/dev/null || true
  kill "$FRONTEND_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${CYAN}Démarrage de ThinkAloud Studio...${NC}"

echo -e "${GREEN}→ Backend API (port 8000)${NC}"
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
deactivate

sleep 1

echo -e "${GREEN}→ Frontend (port 5173)${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${CYAN}ThinkAloud Studio est prêt !${NC}"
echo -e "Ouvrez votre navigateur sur : ${CYAN}http://localhost:5173${NC}"
echo -e "Appuyez sur ${CYAN}Ctrl+C${NC} pour arrêter."

wait
