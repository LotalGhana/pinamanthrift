# 🚀 Deploying Pina's Thrift — Supabase (database) + Vercel (hosting)

This is the **recommended setup**. Supabase gives you a real Postgres database with a ready-made API, and Vercel hosts your static site for free. No backend code to write.

> ⏱ Total time: about 10 minutes.

---

## ✅ The big picture

```
   ┌──────────────────┐         ┌──────────────────┐
   │   Vercel.com     │  HTTPS  │   Supabase.com   │
   │  (your website)  │ ──────▶ │   (database)     │
   │  HTML/CSS/JS     │         │  Postgres + API  │
   └──────────────────┘         └──────────────────┘
```

You'll do two things:

1. **Part A** — Create the database on Supabase and copy 2 keys.
2. **Part B** — Push the site to GitHub and import it into Vercel.

---

# Part A — Create your Supabase database

### 1. Sign up
- Go to **https://supabase.com** → **Start your project** → sign in with GitHub or email.

### 2. Create a new project
- Click **New project**.
- **Name:** `pinas-thrift`
- **Database Password:** click *Generate a password* and **save it somewhere safe** (you won't need it for the website, but you'll need it if you ever access the DB directly).
- **Region:** pick the one closest to your customers (e.g. *West EU (London)* for Ghana).
- Click **Create new project**. Wait ~1 minute for it to provision.

### 3. Install the schema
- In the left sidebar click **SQL Editor**.
- Click **+ New query** (top right).
- Open the file **`supabase-schema.sql`** from your project folder. Copy **all of it**.
- Paste into the editor → click **Run** (bottom right, or `Ctrl/Cmd + Enter`).
- You should see ✅ a success message and a final row saying:
  ```
  Pina's Thrift schema installed. 12 seed products loaded.
  ```

### 4. Grab your 2 connection keys
- Click the ⚙️ gear icon (**Project Settings**) in the left sidebar.
- Click **API**.
- You'll see two values you need:

  | Field | Looks like |
  |---|---|
  | **Project URL** | `https://abcdefghij.supabase.co` |
  | **Project API keys → anon public** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long) |

- Copy both — you'll paste them into `app.js` next.

### 5. Paste them into `app.js`
Open `app.js` in your code editor. At the very top you'll see:

```js
const SUPABASE_CONFIG = {
  url: '',
  anonKey: '',
};
```

Paste your two values between the quotes:

```js
const SUPABASE_CONFIG = {
  url: 'https://abcdefghij.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
```

Save the file. ✅

> **Test locally:** open `index.html` in your browser. Open the DevTools console (F12). You should see `☁ Pina's Thrift: connected to Supabase` in pink. Add a product from `/admin.html` — it should appear in your Supabase dashboard under **Table Editor → products**.

---

# Part B — Deploy to Vercel

You have **two ways** to deploy. Pick whichever is easier for you.

## Option 1 — Drag-and-drop (no GitHub needed, fastest)

1. Go to **https://vercel.com** → sign in.
2. Click **Add New… → Project**.
3. Click the small **"deploy a template or import a third-party Git repo"** link — or just go straight to **https://vercel.com/new** and look for the **drag-and-drop / upload** option.

> ⚠️ Vercel prefers Git, so if you don't see the upload option, use Option 2 below — it's nearly as fast.

## Option 2 — Push to GitHub (recommended, auto-deploys on every change)

### 1. Put your code on GitHub
- Create a new repo at **https://github.com/new** named `pinas-thrift`. Leave it empty (don't add a README).
- In a terminal inside your project folder:
  ```bash
  git init
  git add .
  git commit -m "Pina's Thrift initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR-USERNAME/pinas-thrift.git
  git push -u origin main
  ```
- Don't have Git? Install from **https://git-scm.com**, or just upload the files via GitHub's web UI: New repo → "uploading an existing file" link.

### 2. Import the repo on Vercel
- Go to **https://vercel.com/new**.
- Click **Import** next to your `pinas-thrift` repo.
- **Framework Preset:** leave as **"Other"** (it's a static site).
- Leave **Build Command**, **Output Directory**, and **Install Command** as default/blank.
- **No environment variables needed** — your Supabase keys are already in `app.js`.
- Click **Deploy**.

After ~30 seconds you'll have a live URL like `https://pinas-thrift.vercel.app`.

### 3. (Optional) Rename your site
In Vercel → **Project Settings → Domains** you can change the name to something like `pinasthrift.vercel.app`, or add a custom domain you own (e.g. `pinasthrift.com`).

---

## ✅ Test the live site

Open your Vercel URL on **two different devices** (e.g. phone + computer):

- Phone: browse → add to cart → checkout → place order → note the Order ID
- Computer: open `/admin.html` → log in `admin / admin` → you see the new order ✅
- Computer: change order status to "Processing"
- Phone: refresh Track Order → status updates ✅

Everything is shared because both devices read from the same Supabase database. 🎉

---

## 🧹 You can delete these files (Vercel doesn't need them)

Since you're using Supabase (not Vercel Postgres), these files are unused:

- `api/` folder (the three `.js` files inside)
- `vercel-schema.sql`
- `DEPLOY-VERCEL.md`
- `package.json` (only needed for Vercel Postgres)
- `DEPLOY.md` (the older Netlify guide)

**It's safe to leave them too** — they won't break anything. But removing keeps the folder tidy.

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| Products page is empty / loading forever | Open DevTools console (F12). If you see `❌ permission denied`, re-run `supabase-schema.sql` to apply the security policies. If you see no Supabase connection log, double-check you pasted the URL and key into `app.js` and pushed the change. |
| "Mobile number already registered" but you never registered | You have an old row in the DB. Supabase → **Table Editor → users** → delete it. |
| Admin's status changes don't reach customer's Track page | Both pages must be on the same deployment. Hard-refresh the Track page (Ctrl/Cmd + Shift + R). |
| Want to wipe everything and start fresh | Supabase → SQL Editor → re-run `supabase-schema.sql`. It drops and recreates all tables. |
| Pushed an `app.js` update to GitHub but Vercel still shows the old version | Vercel auto-deploys but takes ~30 sec. Check the **Deployments** tab. Then hard-refresh your browser. |

---

## 🔐 Security notes

- The **anon key** is designed to be public — it's safe in `app.js`. All write access is controlled by **Row Level Security policies** that the schema set up.
- For this hobby/demo store the policies are intentionally **permissive** (any visitor can insert/update). That's required because we're not using Supabase Auth.
- For real production you'd want to: switch user signup/login to Supabase Auth, tighten the RLS policies, and move admin actions behind a service-role key in a serverless function.

Let me know once it's live, or if you hit any snag — happy to help! 💖
