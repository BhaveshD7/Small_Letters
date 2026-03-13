# ✅ PostgreSQL Backend — Supabase Setup

Your backend is now using **PostgreSQL** instead of MongoDB. No more DNS issues!

---

## 🚀 Quick Setup (5 minutes)

### Step 1 — Create Supabase Account (FREE)

1. Go to **supabase.com**
2. Click **Start your project** → Sign in with GitHub
3. Click **New Project**
4. Fill in:
   - Name: `smallletters`
   - Database Password: `smallletters2025` (write this down!)
   - Region: **Southeast Asia (Mumbai)** — closest to you
5. Click **Create new project** → wait 2 minutes for it to set up

---

### Step 2 — Get Your Connection String

1. In Supabase dashboard → **Project Settings** (gear icon, bottom left)
2. Click **Database** (left sidebar)
3. Scroll to **Connection string** → **URI** tab
4. Copy the string — it looks like:
```
postgresql://postgres.xxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```
5. Replace `[YOUR-PASSWORD]` with `smallletters2025`

---

### Step 3 — Update Your .env File

Open `backend/.env` and replace the `DATABASE_URL` line with your Supabase connection string:

```env
DATABASE_URL=postgresql://postgres.xxxxxxxxxx:smallletters2025@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

Keep everything else the same (JWT_SECRET, PORT, etc.)

---

### Step 4 — Install PostgreSQL Package

In your VS Code terminal (backend folder):

```bash
cd C:\Users\ihave\Videos\smallletters\backend
npm install
```

This will install `pg` (PostgreSQL driver) instead of `mongoose`.

---

### Step 5 — Run It

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ PostgreSQL connected
✅ Database tables initialized
```

**Done!** No DNS issues, no network blocking, works on any WiFi.

---

## 📊 View Your Data

Go to Supabase dashboard → **Table Editor** (left sidebar) → you'll see:
- `users` table
- `posts` table
- `subscribers` table

All auto-created when you start the server.

---

## 🆚 What Changed from MongoDB?

Everything works exactly the same from the frontend — same API endpoints, same JSON responses.

Only the backend database changed:
- MongoDB → PostgreSQL
- Mongoose → pg (node-postgres)
- MongoDB Atlas → Supabase

Your React app doesn't need any changes at all.
