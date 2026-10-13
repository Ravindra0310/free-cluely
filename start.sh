#!/bin/bash

# 1. Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null; then
  echo "[1/3] Starting Ollama server..."
  ollama serve &
  OLLAMA_PID=$!
else
  echo "[1/3] Ollama already running."
fi

# 2. Start Vite UI server
echo "[2/3] Starting Vite frontend on port 5180..."
npx vite --port 5180 &
VITE_PID=$!

# 3. Wait for ports to become active
echo "[3/3] Waiting for Ollama (11434) and Vite (5180)..."
npx wait-on -t 30000 tcp:127.0.0.1:11434 http://127.0.0.1:5180

# 4. Launch Electron
echo "Launching Electron Desktop App..."
npm run electron:dev

# Clean up background processes when Electron exits
kill $VITE_PID 2>/dev/null
if [ ! -z "$OLLAMA_PID" ]; then
  kill $OLLAMA_PID 2>/dev/null
fi
