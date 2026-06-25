# QuickBite SQL Lab

A hands-on, beginner-first SQL course that runs entirely in the browser. Read a concept, run real queries against a small food-delivery dataset, and get instant **correct / not quite** feedback on the exercises. No database to install, no signup, no prior SQL knowledge assumed.

It runs a full SQLite engine (compiled to WebAssembly) right in the page, so every query you type is really executed — there's no server and nothing to set up.

## What's inside

- **11 modules, 45 lessons** from absolute basics to advanced, each with plain-language explanation and lots of runnable examples:
  1. Start here (what SQL is, the dataset)
  2. SELECT basics (columns, aliases, calculated columns, ROUND, DISTINCT, LIMIT, ORDER BY)
  3. Filtering with WHERE (operators, AND/OR/NOT, IN, BETWEEN, LIKE, IS NULL)
  4. Cleaning data & CASE logic (IFNULL/COALESCE, TRIM and string functions, CASE WHEN)
  5. Aggregating & grouping (SUM/AVG/MIN/MAX, COUNT, GROUP BY, HAVING)
  6. Joins — **every type** (INNER, LEFT, anti-join, **RIGHT**, **FULL OUTER**, **CROSS**, **SELF**, plus UNION/INTERSECT/EXCEPT)
  7. Subqueries & CTEs (scalar, IN + nesting, the WITH clause)
  8. Window functions (OVER, PARTITION BY, running totals, ROW_NUMBER/RANK/DENSE_RANK, NTILE, LAG/LEAD, FIRST/LAST/NTH_VALUE)
  9. Dates & times (extracting parts, date differences, gaps between purchases)
  10. Changing data — bonus (CREATE TABLE, INSERT, UPDATE, DELETE)
  11. Free sandbox (open playground, no checking)

- **84 worked examples** you can run and edit, and **44 checked exercises**.
- A **Tables** button that shows the live schema and sample rows.
- The database **resets on every Run**, so you can't break anything — and INSERT/UPDATE/DELETE examples are completely safe.

> Note on SQL flavor: the lessons teach standard SQL using SQLite. Where the syntax differs from BigQuery (the dialect in the original class doc) — e.g. `strftime` instead of `EXTRACT`, `julianday` subtraction instead of `DATE_DIFF`, `||` instead of `CONCAT` — there's an inline "Dialect note" explaining the difference.

## The dataset: QuickBite

A small fictional food-delivery app with four tables:

- `customers` — customer_id, first_name, last_name, city, signup_date, referred_by
- `categories` — category_id, category_name
- `products` — product_id, product_name, category_id, price, size
- `orders` — order_id, customer_id, product_id, quantity, unit_price, order_date, order_time

Revenue for one order row is `quantity * unit_price`.

## Run it locally

It's a static site, so any static file server works. From this folder:

```bash
# Python (already on most machines)
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly with `file://` may fail in some browsers because of how WebAssembly is fetched — use a local server (the command above) instead.

## Deploy to Vercel

This is a plain static site (HTML/CSS/JS, no build step, no framework), so deployment is simple. The SQLite engine and the code editor are **vendored locally** in `vendor/`, so the site works without any external services. Pick whichever option you like:

### Option A — Drag and drop (no tools, ~1 minute)
1. Go to **https://vercel.com** and sign in (free).
2. Click **Add New… → Project**, then choose the **deploy a folder / upload** path (you can also drag this whole folder onto the dashboard).
3. Drop this entire folder (the one containing `index.html`).
4. Vercel detects it as a static site automatically — no settings to change. Click **Deploy**.
5. You'll get a live URL in a few seconds.

### Option B — Vercel CLI
```bash
npm install -g vercel
cd path/to/this/folder
vercel            # follow the prompts; accept the defaults
vercel --prod     # promote to a production URL
```
When asked about build settings, accept the defaults — there is **no build command** and the **output directory is the project root**.

### Option C — From GitHub
1. Push this folder to a new GitHub repository.
2. In Vercel, click **Add New… → Project** and **Import** that repo.
3. Framework preset: **Other**. Build command: **none**. Output directory: **leave as the root**.
4. Click **Deploy**.

No `vercel.json` is required — a static site with an `index.html` at the root just works.

## Files

```
index.html                     page shell
styles.css                     all styling (design tokens at the top)
app.js                         engine init, query runner, answer checker, UI
db.js                          the QuickBite dataset (SEED_SQL) — reseeded on every run
lessons.js                     all lesson content, examples, and exercises
vendor/
  sql-wasm.js                  sql.js loader (SQLite compiled to WebAssembly)
  sql-wasm.wasm                the SQLite engine
  codemirror.js / .css         code editor (optional enhancement)
  codemirror-sql-mode.js       SQL syntax highlighting
README.md                      this file
```

Fonts load from Google Fonts when online and fall back to your system fonts otherwise.
