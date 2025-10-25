# MER Frontend (scaffold)

This folder contains the React frontend scaffold for the Multimodal Emotion Recognition (MER) system.

Prerequisites

- Node.js 18+ and npm

Install

```powershell
cd "C:/Users/Raj kumar/Desktop/React js/2025/Raja/client"
npm install
```

Run (development)

```powershell
npm start
```

Notes

- Environment variable `REACT_APP_API_URL` is set in `.env` to `http://localhost:5000`.
- This scaffold includes skeletons for Redux slices, API socket services, and basic pages (Home, Login, Register, LiveAnalysis).
- Next steps: implement auth service, wire slices to API endpoints, and build LiveAnalysis UI/Socket pipeline.
