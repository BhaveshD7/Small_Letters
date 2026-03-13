# small letters 🤍

> love, written down before it disappears.

A personal writing website for love quotes, phrases, paragraphs, and the **Love in Small Letters** series — 5 parts, 5 pieces each.

**Domain:** smallletters.in (+ smallletters.com → redirects to .in)

**Tech Stack:** PERN (PostgreSQL + Express + React + Node.js)

---

## 🗂️ Structure

```
smallletters/
├── backend/                   ← Node.js + Express API (port 5000)
│   ├── server.js
│   ├── config/
│   │   ├── db.js              ← PostgreSQL connection
│   │   ├── initDB.js          ← Auto-creates tables
│   │   └── email.js           ← Nodemailer
│   ├── models/                ← User, Post, Subscriber (PostgreSQL)
│   ├── routes/                ← auth, posts (+ series), subscribers
│   ├── controllers/           ← business logic
│   └── middleware/            ← JWT protect + adminOnly
│
└── frontend/                  ← React (Vite) app (port 5173)
    └── src/
        ├── pages/             ← Home, Post, Series, Archive, About, etc.
        ├── components/        ← Navbar, PostCard, SubscribeForm
        ├── api/               ← Axios calls to backend
        └── context/           ← AuthContext (global login state)
```

---

## ⚡ Quick Start

### Step 1 — Unzip and Open in VS Code

```bash
# Extract the zip
unzip smallletters.zip
cd smallletters

# Open in VS Code
code .
```

---

### Step 2 — Set Up Supabase (FREE PostgreSQL)

**👉 Full guide:** Open `SUPABASE-SETUP.md` in this folder for step-by-step instructions.

**Quick version:**
1. Go to **supabase.com** → Create free account
2. New Project → Name: `smallletters`, Password: `smallletters2025`, Region: Mumbai
3. Copy your connection string from **Project Settings → Database**
4. Put it in `backend/.env` as `DATABASE_URL`

Example `.env`:
```env
DATABASE_URL=postgresql://postgres.xxxxx:smallletters2025@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
JWT_SECRET=wtv_smallletter_enter2026lovewriting
```

---

### Step 3 — Run Backend

```bash
cd backend
npm install
npm run dev
```

✅ You should see:
```
🚀 Server running on http://localhost:5000
✅ PostgreSQL connected
✅ Database tables initialized
```

---

### Step 4 — Run Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

✅ App runs at: **http://localhost:5173**

---

## 🔐 Make Yourself Admin

1. Go to **localhost:5173/signup** → create your account
2. Open **Supabase dashboard** → Table Editor → `users` table
3. Find your user → Edit → change `role` from `reader` to `admin`
4. Sign in → you'll see **+ write** button in navbar

---

## 📖 The Series Structure

| Series slug                  | Title                       |
|------------------------------|-----------------------------|
| love-in-small-letters-i      | the beginning of love       |
| love-in-small-letters-ii     | love that stays             |
| love-in-small-letters-iii    | the distance between us     |
| love-in-small-letters-iv     | what love leaves behind     |
| love-in-small-letters-v      | loving yourself, finally    |

Each series has 5 posts with `series_position: 1–5`.

---

## 📡 API Endpoints

All endpoints work exactly the same as before — only the database changed from MongoDB to PostgreSQL.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/posts | — | All published posts |
| GET | /api/posts/popular | — | Top 5 by likes |
| GET | /api/posts/series | — | All 5 series with preview |
| GET | /api/posts/series/:slug | — | Posts in one series |
| GET | /api/posts/:slug | — | Single post + siblings |
| POST | /api/posts | Admin | Create post |
| POST | /api/auth/login | — | Sign in |
| POST | /api/subscribers | — | Subscribe |

---

## 🚀 Deploy

- **Frontend** → Vercel (root: `frontend/`, framework: Vite)
- **Backend** → Render (root: `backend/`, start: `node server.js`)
- **Database** → Supabase (already set up in Step 2)

Your Supabase database URL works for both local dev and production — no changes needed.

---

## ❓ Why PostgreSQL Instead of MongoDB?

MongoDB Atlas had DNS resolution issues on some networks. PostgreSQL via Supabase:
- ✅ Works on any network (no SRV DNS lookups)
- ✅ Better for structured data like posts/users
- ✅ Free tier is more generous
- ✅ Same API endpoints — frontend unchanged

Everything works exactly the same from the user's perspective.
