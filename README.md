# Nyx Chatbot

Nyx is a full-stack chatbot built with **FastAPI** on the backend and **Next.js** on the frontend. It uses **PostgreSQL** for message storage and integrates with OpenAI's **GPT-5 Nano** (or mock responses for testing).

## Features

- 👤 **Authentication**: Email/password authentication using HTTP-only cookies.
- 💬 **Thread Management**: Create and manage multiple chat threads.
- ⚡ **Animations**: Smooth UI transitions powered by Framer Motion.
- 🧪 **Rate Limiting**: Threads are limited to 10 replies to keep token usage efficient.
- 🌑 **Dark Theme**: Clean, simplistic premium dark UI.

## Tech Stack

### Frontend (`/client`)
- Next.js (App Router)
- TypeScript
- Framer Motion
- React Markdown
- Vanilla CSS

### Backend (`/server`)
- FastAPI
- PostgreSQL (SQLAlchemy ORM)
- python-jose (JWT)
- bcrypt (Password hashing)
- OpenAI Python SDK

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL instance

### Backend Setup
1. Navigate to `/server`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
4. Install dependencies: `pip install -r requirements.txt`.
5. Copy `.env.example` to `.env` and fill in your database credentials and OpenAI API key.
6. Run the server: `python main.py` or use the absolute path with uvicorn.

### Frontend Setup
1. Navigate to `/client`.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment
Ensure you update the `allow_origins` in `server/main.py` and the `BASE_URL` in `client/src/lib/api.ts` for your production domain.
