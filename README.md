# 🚀 Free Cluely

> **An open-source, stealth desktop AI copilot powered by Ollama and Google Gemini.**  
> Get instant, real-time insights, code explanations, problem-solving, and meeting assistance directly on your desktop—completely private, offline, and free.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Ollama](https://img.shields.io/badge/AI-Ollama%20(Local%20%26%20Private)-orange.svg)](https://ollama.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4.svg)](https://ai.google.dev/)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)](https://electronjs.org/)

---

## ✨ Features

- 🔒 **100% Private & Local AI (Ollama)**: Run powerful models directly on your hardware without sending data to third parties.
- ⚡ **Ultra-Fast & Contextual**: Instant problem breakdown, optimal code generation, time/space complexity, and follow-ups.
- 🎨 **Rich Syntax Highlighting**: Auto-detects programming languages (C++, Python, Java, JavaScript, TypeScript, Go, Rust, etc.) with one-click copy and formatted code blocks.
- 👻 **Stealth Overlay Window**: Transparent, always-on-top, click-through or draggable desktop overlay that stays out of your way.
- 📸 **Smart Screen Snapping**: Capture targeted areas or full screens with a quick global hotkey (`Cmd/Ctrl + H`).
- 🖱️ **macOS Cursor Fix**: Native bundle integration ensuring the mouse pointer never disappears while hovering overlay elements.
- 🚀 **One-Click Launch Script**: Automated `./start.sh` script to verify Ollama, boot the Vite frontend on port `5180`, and start the Electron client seamlessly.

---

## 📋 Prerequisites

Before getting started, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- **For Local AI**: [Ollama](https://ollama.com/) installed
- **For Cloud AI (Optional)**: A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 🦙 Quick Setup Guide: Using Ollama (Recommended)

Running Free Cluely with Ollama keeps all your data strictly on your machine, zero cost, and zero API limits.

### Step 1: Install Ollama

- **macOS** (Homebrew or direct download):
  ```bash
  brew install ollama
  # or download from https://ollama.com/download
  ```
- **Linux**:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```
- **Windows**:
  Download and run the installer from [ollama.com/download/windows](https://ollama.com/download/windows).

---

### Step 2: Download Your Preferred Model

Open your terminal and pull a model. Here are top recommendations:

| Model | Command | Best For |
|---|---|---|
| **Llama 3.2 (3B)** *(Default)* | `ollama pull llama3.2` | Balanced, fast, low RAM usage |
| **Qwen 2.5 Coder (7B)** | `ollama pull qwen2.5-coder` | Best-in-class coding & algorithm logic |
| **DeepSeek R1 (8B/7B)** | `ollama pull deepseek-r1:8b` | Deep step-by-step reasoning & math |
| **CodeLlama (7B)** | `ollama pull codellama` | Specialized code solutions |
| **Mistral (7B)** | `ollama pull mistral` | Quick and lightweight chat |

---

### Step 3: Start the Ollama Service

Make sure the Ollama daemon is running:
```bash
ollama serve
```
*(By default, Ollama listens on `http://localhost:11434`)*. You can verify it's working by opening `http://localhost:11434` in your browser.

---

### Step 4: Clone the Repository & Install Dependencies

```bash
git clone https://github.com/Ravindra0310/free-cluely.git
cd free-cluely

# Install npm dependencies
npm install
```

> **macOS Note**: If you encounter Sharp build warnings, run:
> ```bash
> SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --ignore-scripts
> npm rebuild sharp
> ```

---

### Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env 2>/dev/null || touch .env
```

Add the following configuration for **Ollama**:

```env
USE_OLLAMA=true
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434
```

*(If you pulled a different model like `qwen2.5-coder`, set `OLLAMA_MODEL=qwen2.5-coder`)*.

---

### Step 6: Launch the App

You can launch everything using the automated start script or manually with npm:

#### Option A: One-Click Startup Script (Recommended)
```bash
chmod +x start.sh
./start.sh
```
*This script automatically checks if Ollama is running, starts the Vite frontend on port 5180, waits for services, and launches Electron.*

#### Option B: Standard npm Command
```bash
npm start
```
*(Runs Vite on port 5180 and launches Electron concurrently).*

---

## ☁️ Alternative: Google Gemini Setup

If you prefer using Google's cloud Gemini model instead of Ollama:

1. Obtain a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In your `.env` file, configure:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   USE_OLLAMA=false
   ```
3. Run `npm start`.

---

## ⌨️ Keyboard Shortcuts & Controls

| Shortcut (macOS) | Shortcut (Windows/Linux) | Action |
|---|---|---|
| `Cmd + B` | `Ctrl + B` | Toggle assistant window visibility (Show / Hide) |
| `Cmd + H` | `Ctrl + H` | Capture screen snip / screenshot |
| `Cmd + Enter` | `Ctrl + Enter` | Generate solution for captured content |
| `Cmd + Arrow Keys` | `Ctrl + Arrow Keys` | Move the overlay window position |
| `Cmd + Q` | `Ctrl + Q` | Quit application |

---

## 🛠️ Project Structure

```text
free-cluely/
├── electron/
│   ├── LLMHelper.ts         # Handles Ollama API and Gemini integrations
│   ├── WindowHelper.ts      # Transparent overlay and window controls
│   ├── ipcHandlers.ts       # IPC communication between UI and Node
│   ├── main.ts              # Electron entry point & global shortcuts
│   └── fix_cursor.node      # Native macOS cursor unhiding module
├── src/
│   ├── _pages/              # Queue, Solutions, Debug views
│   ├── components/          # Overlay UI & syntax-highlighted code blocks
│   └── index.css            # Dark glassmorphic styling
├── start.sh                 # Unified launch script (Ollama + Vite + Electron)
└── package.json             # Build and dev commands
```

---

## ❓ Troubleshooting

### 1. "Failed to connect to Ollama"
- Ensure Ollama is running in the background:
  ```bash
  ollama serve
  ```
- Test connectivity:
  ```bash
  curl http://localhost:11434/api/tags
  ```
- If running inside Docker or a remote host, update `OLLAMA_URL` in your `.env`.

### 2. Port `5180` already in use
- Kill any orphaned Vite processes:
  ```bash
  lsof -ti :5180 | xargs kill -9 2>/dev/null || true
  ```

### 3. Cursor disappears on macOS
- The repository already includes compiled cursor fix binaries (`fix_cursor.node` / `unhide_cursor`) automatically loaded by `WindowHelper.ts`. If cursor behaves unexpectedly, simply restart the app via `./start.sh`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request on the [GitHub Repository](https://github.com/Ravindra0310/free-cluely).

---

## 📄 License

This project is licensed under the **ISC License**.
