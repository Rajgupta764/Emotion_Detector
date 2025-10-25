# MER Server (scaffold)

This is a minimal backend scaffold for the Multimodal Emotion Recognition system.

Features:

- Express server with Socket.io
- MongoDB models: User, Session, EmotionLog
- Auth routes (register/login/me) with JWT
- Analyze REST endpoints (text/audio/image/fuse) that call a mock ML service
- Socket handlers for real-time video/audio/text events that produce mock emotion results

Quick start

1. Copy `.env.example` to `.env` and adjust values (MongoDB URI, JWT secret):

```powershell
cd "C:/Users/Raj kumar/Desktop/React js/2025/Raja/server"
copy .env.example .env
```

1. Install dependencies:

```powershell
npm install
```

1. Run the server (dev):

```powershell
npm run dev
```

The server listens on `PORT` (default 5000). The Socket.io endpoint is on the same host (e.g. [http://localhost:5000](http://localhost:5000)).

Notes

- `mlService` is a mock that returns synthetic emotion scores for demo and testing.
- For production, replace `mlService` with real ML microservices or cloud APIs.
