#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ████████╗██╗  ██╗██╗███╗   ██╗██╗  ██╗ █████╗ ██╗      ██████╗ ██╗   ██╗██████╗ "
echo "  ╚══██╔══╝██║  ██║██║████╗  ██║██║ ██╔╝██╔══██╗██║     ██╔═══██╗██║   ██║██╔══██╗"
echo "     ██║   ███████║██║██╔██╗ ██║█████╔╝ ███████║██║     ██║   ██║██║   ██║██║  ██║"
echo "     ██║   ██╔══██║██║██║╚██╗██║██╔═██╗ ██╔══██║██║     ██║   ██║██║   ██║██║  ██║"
echo "     ██║   ██║  ██║██║██║ ╚████║██║  ██╗██║  ██║███████╗╚██████╔╝╚██████╔╝██████╔╝"
echo "     ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ "
echo -e "${NC}"
echo -e "${CYAN}Studio de Production Audio — Installation${NC}"
echo ""

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}✗ $1 non trouvé${NC}"
    return 1
  fi
  echo -e "${GREEN}✓ $1 trouvé${NC}"
}

echo -e "${YELLOW}Vérification des dépendances système...${NC}"
check_command python3 || { echo "Installez Python 3.11+ : sudo apt install python3"; exit 1; }
check_command node    || { echo "Installez Node.js 20+ : https://nodejs.org"; exit 1; }
check_command npm     || { echo "Installez npm"; exit 1; }
check_command ffmpeg  || { echo -e "${YELLOW}⚠ ffmpeg non trouvé. Installation...${NC}"; sudo apt install -y ffmpeg; }
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}Installation du backend Python...${NC}"
cd "$SCRIPT_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ .env créé depuis .env.example${NC}"
fi
deactivate
echo -e "${GREEN}✓ Backend installé${NC}"
echo ""

echo -e "${YELLOW}Installation du frontend Node.js...${NC}"
cd "$SCRIPT_DIR/frontend"
npm install --silent
echo -e "${GREEN}✓ Frontend installé${NC}"
echo ""

echo -e "${GREEN}Installation terminée !${NC}"
echo -e "Lancez l'application avec : ${CYAN}./start.sh${NC}"
