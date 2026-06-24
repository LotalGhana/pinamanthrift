# ▲ Deploying Pina's Thrift to Vercel (with Vercel Postgres)

This guide walks you through hosting the entire site — frontend **and** database — on **Vercel** (free tier).

> ⚙️ Architecture: your HTML/CSS/JS files are served as a static site, while the files in the `/api` folder become serverless functions that talk to your Postgres database.

---

## Part 1 — Push your code to GitHub

Vercel deploys from a Git repo (easiest path for ongoing updates).

1. Create a new repo on **https://github.com/new** named `pinas-thrift`.
2. In a terminal, inside your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/pinas-thrift.git
   git push -u origin main
   ```

> 🛑 Don't have Git? Install it from https://git-scm.com — or skip this and use Vercel's CLI (`npm i -g vercel`, then `vercel` in the folder).

---

## Part 2 — Create the Vercel project

1. Go to **https://vercel.com** → sign in with GitHub.
2. Click **Add New… → Project**.
3. Select your `pinas-thrift` repo → click **Import**.
4. **Framework Preset:** leave as **"Other"** (it's a static site + serverless functions).
5. Leave **Build Command**, **Output Directory**, and **Install Command** blank/default.
6. Click **Deploy**.

After ~30 seconds you'll have a URL like `https://pinas-thrift.vercel.app`. The site will load but you'll see errors because the database doesn't exist yet — that's the next step.

---

## Part 3 — Create the Vercel Postgres database

1. In your Vercel project dashboard, click the **Storage** tab.
2. Click **Create Database** → choose **Postgres** (powered by Neon).
3. Pick a name like `pinas-db` and a region close to you → click **Create**.
4. On the next screen, click **Connect Project** → select your `pinas-thrift` project → click **Connect**.
   - This automatically adds environment variables (`POSTGRES_URL`, etc.) to your project — no manual setup.
5. Open the **Query** tab in your new database.
6. Open the file **`vercel-schema.sql`** from your project folder, copy all of it, paste into the Query box, and click **Run Query**.
7. You should see a success message:
   ```
   Pina's Thrift schema installed. 12 seed products loaded.
   ```

---

## Part 4 — Redeploy so functions pick up the env vars

The first deploy happened **before** the database was connected, so the serverless functions don't have the connection string yet.

1. Go to your project's **Deployments** tab.
2. Click the **⋯** menu on the latest deployment → **Redeploy** → confirm.
3. Wait ~30 seconds for the new deploy.

Open your live URL — products should now load from the database. 🎉

---

## Part 5 — Test the full flow

1. Open your URL on a phone. Browse products, add to cart, place an order.
2. Open `/admin.html` on a different computer. Log in with `admin / admin`.
3. You should see the order. Change its status.
4. On the phone, go to **Track Order** and enter the Order ID → status reflects the change.

---

## 🧰 Local development

Before pushing changes, you can test locally:

```bash
npm i -g vercel        # one-time install
npm install            # install @vercel/postgres
vercel link            # link folder to your Vercel project
vercel dev             # runs the site + API at http://localhost:3000
```

`vercel dev` will pull your database env vars and run the API functions locally with hot reload.

---

## 📁 Project structure (what each file does)

```
pinas-thrift/
├── index.html          ← Homepage
├── auth.html           ← Login / Register / OTP / Reset
├── cart.html           ← Shopping cart
├── checkout.html       ← Checkout + payment info
├── track.html          ← Order tracking timeline
├── admin.html          ← Admin dashboard
├── app.js              ← Shared frontend logic (auto-detects DB mode)
├── styles.css          ← Shared styling
├── package.json        ← Tells Vercel to install @vercel/postgres
├── vercel-schema.sql   ← One-time DB setup (run in Vercel SQL editor)
└── api/                ← Serverless functions (the "backend")
    ├── products.js     ← GET/POST/PATCH/DELETE /api/products
    ├── orders.js       ← GET/POST/PATCH /api/orders
    └── users.js        ← /api/users?action=register|login|reset|check|find
```

---

## ❓ Switching modes

At the top of `app.js`:

```js
const USE_VERCEL_API = true;          // <- on Vercel? leave true
const VERCEL_API_BASE = '/api';
```

- **`USE_VERCEL_API = true`** → uses Vercel Postgres via `/api/*` functions (default).
- **`USE_VERCEL_API = false`** + Supabase config filled in → uses Supabase instead.
- Both off → uses `localStorage` for offline / local dev.

If a serverless function call fails, the site **auto-falls-back** to localStorage and logs a warning to the browser console, so the storefront never breaks.

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| Products page is empty | Did you run `vercel-schema.sql` in the Storage → Query tab? Then redeploy. |
| `500` from `/api/products` | Check **Project → Deployments → Functions** logs. Most often the database isn't linked — go to Storage → your DB → Connect Project. |
| Changes don't show up | Vercel deploys automatically on every `git push`. Check the Deployments tab to see if the build succeeded. |
| Want to wipe data and start over | Storage → your DB → Query → run `vercel-schema.sql` again (it drops and recreates the tables). |
| "Cannot find module '@vercel/postgres'" | Make sure `package.json` is committed and pushed. Vercel reads it during deploy. |

---

## 🔐 Security note

For a hobby/demo store the admin uses simple `admin/admin` credentials checked in the browser. For real production:
- Move admin auth into the serverless functions (check a secret env var like `ADMIN_PASSWORD`)
- Hash user passwords with `bcryptjs` before storing
- Rate-limit the login endpoint

Let me know if you want me to add any of that.

Enjoy your live shop! 💖
