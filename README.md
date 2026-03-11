# 🧠 Jarvis — Web Frontend

Web client for the **Jarvis** cross-device AI assistant. Built with Next.js, TypeScript, Tailwind, and shadcn/ui.

---

## ✨ Features

- 🔐 **Auth** — Login, register, JWT session
- 💬 **Chat** — Conversations with Jarvis, history, follow-up suggestions
- 🎤 **Voice** — Speak to Jarvis; get text + voice reply (STT → LLM → TTS)
- ✅ **Tasks** — List, create, update status & priority
- 📱 **Devices** — View connected agents, deactivate
- ⚙️ **Settings** — Profile, proactive toggles, AI provider placeholders
- 📊 **Dashboard** — Welcome, quick stats, proactive updates, recent conversations

---

## 🚀 Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.local.example .env.local
```

Set your backend URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 📁 Project Structure

| Area | Description |
|------|-------------|
| `src/app/` | Next.js App Router — pages & layouts |
| `src/components/` | UI (shadcn, layout, shared) |
| `src/lib/contracts/` | Shared types, API client, WebSocket, token storage (portable) |
| `src/lib/auth/` | Auth store & route guard |
| `src/lib/hooks/` | TanStack Query hooks |
| `src/lib/providers/` | React context (query, auth init, WebSocket) |

---

## 🔌 Backend

This frontend talks to the **Jarvis backend** (FastAPI). You need it running for auth, chat, voice, tasks, and devices.

- Health: `GET /health`
- API base: `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000`)

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

---

## 📄 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Jarvis Backend](https://github.com/your-org/jarvis) — API & device agents
