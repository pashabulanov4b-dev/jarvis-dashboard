#!/bin/bash
# Запуск Jarvis Dashboard однією командою:  ./start.sh
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Створив .env — впиши туди ANTHROPIC_API_KEY і запусти ./start.sh ще раз."
  exit 1
fi

if [ ! -d .venv ]; then
  echo "→ Створюю Python-середовище…"
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

if [ ! -d web/dist ] || [ "$1" == "--rebuild" ]; then
  echo "→ Збираю дашборд…"
  (cd web && npm install --silent && npm run build)
fi

echo "→ Jarvis запущено: http://127.0.0.1:${PORT:-8765}"
python -m core.main
