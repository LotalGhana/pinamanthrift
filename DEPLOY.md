# 🚀 Deploying Pina's Thrift to Netlify (with a real Supabase database)

This guide walks you through hosting the site on **Netlify** (free) and connecting it to a real **Supabase** database (free) so that products, users, and orders persist across devices and browsers.

> The site is built with vanilla HTML/CSS/JS, so deployment is straightforward — no build step required.

---

## Part 1 — Create your free database (Supabase)

1. Go to **https://supabase.com** and click **Start your project** → sign up (GitHub or email).
2. Click **New project**.
   - **Name:** `pinas-thrift`
   - **Database Password:** create a strong password and save it somewhere safe
   - **Region:** choose the one closest to you (e.g. `West EU` or `West US`)
   - Click **Create new project** (takes ~1 minute).
3. Once your project is ready, open the left sidebar → **SQL Editor** → click **+ New query**.
4. Open the file **`supabase-schema.sql`** from this project, copy **all of it**, paste into the editor, and click **Run** (bottom right).
   - You should see ✅ `Success. No rows returned` and a final row saying *"Pina's Thrift schema installed. 12 seed products loaded."*
5. Now click the gear icon (**Project Settings**) → **API**. You'll see two values you need:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **Project API keys → anon public** — a long string starting with `eyJ...`

Keep this tab open — you'll paste these into the site in the next step.

---

## Part 2 — Connect the site to your database

1. Open **`app.js`** in your code editor.
2. At the very top you'll find this block:

   ```js
   const SUPABASE_CONFIG = {
     url: '',     // <-- paste your Supabase Project URL here
     anonKey: '', // <-- paste your Supabase anon/public key here
   };
   ```

3. Paste the two values from Supabase between the quotes. Example:

   ```js
   const SUPABASE_CONFIG = {
     url: 'https://abcdefgh.supabase.co',
     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   };
   ```

4. Save the file. **That's it** — the site will now use your real database.

> **Test locally first:** open `index.html` in your browser. Add products from the admin panel — refresh — they should persist. Open in a different browser and verify the data is the same.

> 💡 If you leave `url` and `anonKey` empty, the site falls back to `localStorage` mode (per-browser only), which is great for offline development.

---

## Part 3 — Deploy to Netlify

### Option A — Drag & drop (fastest, 30 seconds)

1. Go to **https://app.netlify.com/drop**.
2. Drag the **entire folder** containing your files (`index.html`, `app.js`, `styles.css`, etc.) onto the page.
3. Netlify gives you a live URL like `https://gleaming-pina-1234.netlify.app`. Done!

### Option B — Connect a GitHub repo (auto-deploys when you push changes)

1. Push your project folder to a GitHub repo.
2. On Netlify, click **Add new site → Import an existing project → GitHub**.
3. Pick your repo. Leave build settings empty:
   - **Build command:** *(blank)*
   - **Publish directory:** `.` (a single dot — current folder)
4. Click **Deploy**.

### Custom site name

In Netlify, go to **Site configuration → Change site name** to get something like `pinas-thrift.netlify.app`.

### Custom domain (optional)

If you own a domain (e.g. `pinasthrift.com`):
**Site configuration → Domain management → Add a custom domain** and follow the DNS instructions.

---

## Part 4 — Test the live site

Open your Netlify URL on your phone and on your computer:

- ✅ Browse products → both devices see the same items
- ✅ Place an order from your phone → log into admin (`admin/admin`) on your computer → the order appears
- ✅ Change order status in admin → refresh the Track page on the phone → status updates

---

## 🔐 Security notes (please read)

- The **anon key** is meant to be public — it's fine that it lives in `app.js`. All write access is controlled by **Row Level Security policies** that were created by the schema.
- For this hobby/demo store the RLS policies are intentionally **permissive** (any visitor can insert/update). That's necessary because we're not using Supabase Auth.
- **For real production use** you should:
  1. Switch user signup/login to Supabase Auth (which hashes passwords and handles sessions properly).
  2. Add a `service_role` Netlify Function for admin-only actions (status updates, product deletion).
  3. Tighten the RLS policies to require authenticated users.

If you want me to upgrade the site to real Supabase Auth later, just ask.

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| Products page is empty after deploy | Open browser DevTools → Console. If you see `401` or `permission denied`, re-run `supabase-schema.sql` to apply RLS policies. |
| "Mobile number already registered" but you never registered | You may have an old test record in the `users` table. Open Supabase → **Table Editor → users** and delete the row. |
| Admin changes don't appear for customers | Make sure both pages are connected to Supabase (check that `SUPABASE_CONFIG.url` is set). If one is using localStorage they won't sync. |
| Want to wipe everything and start over | Open Supabase → SQL Editor → re-run `supabase-schema.sql`. It drops and recreates all tables. |

Enjoy your shop! 💖
