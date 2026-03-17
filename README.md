# ReelAY

Mobile-first short-form video social media platform.

## Stack

- Frontend: React + Vite + TailwindCSS + Zustand
- Backend: Node.js + Express + Socket.io
- Database: MongoDB
- Storage: AWS S3 (video/image CDN)
- Cache: Redis

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Docker (all services)

```bash
docker-compose up -d
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Strong random secrets
- `AWS_*` - S3 credentials for video/image storage
- `SMTP_*` - Email credentials for password reset
- `CLIENT_URL` - Frontend URL (default: http://localhost:5173)

## Features

- JWT auth with refresh tokens, password reset via email
- Vertical reel feed with snap scrolling
- Like, comment, share, save reels
- Algorithmic feed (following + trending)
- Stories (24h expiry via MongoDB TTL)
- Real-time messaging with typing indicators and read receipts
- WebSocket presence (online/offline)
- Push notifications via Socket.io
- Search users, reels, hashtags
- Admin dashboard with analytics, user management, content moderation
