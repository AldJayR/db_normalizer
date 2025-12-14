# Database Normalization System - Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm
- Gemini API key from Google AI Studio

## Environment Configuration

### Backend (server/)

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Configure the following variables in `server/.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   PORT=3001
   HOST=0.0.0.0
   CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
   ```

   - `GEMINI_API_KEY`: Required. Get from https://aistudio.google.com/apikey
   - `PORT`: Server port (default: 3001)
   - `HOST`: Server host (use 0.0.0.0 for production, localhost for dev)
   - `CORS_ORIGIN`: Comma-separated list of allowed frontend origins

### Frontend (client/)

1. Copy the example environment file:
   ```bash
   cp client/.env.example client/.env
   ```

2. Configure the following variables in `client/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

   - `VITE_API_URL`: Backend API URL (update for production deployment)

## Development

### Start Backend
```bash
cd server
pnpm install
pnpm run dev
```

### Start Frontend
```bash
cd client
pnpm install
pnpm run dev
```

Visit http://localhost:5173

## Production Build

### Backend
```bash
cd server
pnpm install --prod
pnpm run build
pnpm start
```

The server will compile TypeScript to `dist/` and run the production build.

### Frontend
```bash
cd client
pnpm install
pnpm run build
```

The built files will be in `client/dist/`. Deploy to any static hosting (Vercel, Netlify, etc.).

## Production Deployment Checklist

### Backend
- [ ] Set `GEMINI_API_KEY` in production environment
- [ ] Set `HOST=0.0.0.0` to accept external connections
- [ ] Update `CORS_ORIGIN` with actual frontend domain(s)
- [ ] Set `PORT` as needed (or use cloud provider's PORT env var)
- [ ] Run `pnpm run build` to compile TypeScript
- [ ] Start with `pnpm start` (runs compiled dist/index.js)
- [ ] Consider adding rate limiting middleware
- [ ] Set up monitoring and logging

### Frontend
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Run `pnpm run build`
- [ ] Deploy `dist/` folder to static hosting
- [ ] Configure custom domain and HTTPS
- [ ] Update backend CORS_ORIGIN to include production domain

## Architecture

- **Backend**: Fastify + TypeScript + Google Gemini 2.5 Flash
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **AI Model**: Gemini 2.5 Flash via @google/genai SDK

## Security Notes

- Never commit `.env` files to version control
- Keep `GEMINI_API_KEY` secure
- Input validation is enforced (max 5000 chars for attributes, 10000 for business rules)
- CORS is restricted to configured origins only

## Troubleshooting

**Backend won't start:**
- Verify `GEMINI_API_KEY` is set correctly
- Check port 3001 isn't already in use

**Frontend can't reach backend:**
- Verify `VITE_API_URL` points to correct backend
- Check CORS_ORIGIN includes frontend domain
- Ensure backend is running and accessible

**Build errors:**
- Run `pnpm install` in both client and server
- Verify TypeScript version compatibility
- Check Node.js version (18+)
