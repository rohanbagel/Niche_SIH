# NICHE SIH 2026 🎯

> **Real-Time Problem Statement Intelligence & Competition Tracker for Smart India Hackathon 2026.**

Niche SIH tracks live idea submission counts across all official SIH 2026 problem statements, automatically diffs updates every 15 minutes, detects brand-new problem statement drops, and helps teams find high-probability, low-competition problem statements.

---

## ⚡ The Strategy

In the Smart India Hackathon, teams that pick a Problem Statement with fewer existing submissions have a statistically superior chance of getting shortlisted. Selection pressure is distributed **per problem statement**, not across the entire hackathon. 

The official SIH portal displays submission numbers but offers no way to sort by competition, filter by idea caps, or get notified when new problem statements drop midway through the registration phase. **Niche SIH solves this.**

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│              AWS EC2 Mumbai (ap-south-1)                │
│                                                         │
│   Cron Daemon (Every 15 Minutes)                        │
│     └─► ~/run_scraper.sh                                │
│           └─► curl_cffi (Chrome 124 TLS Fingerprint)    │
└────────────────────────────┬────────────────────────────┘
                             │
     1. Direct HTTP Request  │ (Bypasses Azure WAF with Indian IP)
                             ▼
                  ┌─────────────────────┐
                  │   sih.gov.in (WAF)  │
                  │   Status: 200 OK ✅ │
                  └──────────┬──────────┘
                             │
       2. Parse 233+ PS      │
          Diff idea counts   ▼
                  ┌─────────────────────┐
                  │   Supabase Cloud    │
                  │   PostgreSQL DB     │
                  │   (Upsert & Logs)   │
                  └──────────┬──────────┘
                             │
       3. Realtime Fetch     │ (Zero-reload DOM diffing)
                             ▼
                  ┌─────────────────────┐
                  │  React 19 Frontend  │
                  │  Vite + Brutalist   │
                  │  (Hosted on Vercel) │
                  └─────────────────────┘
```

---

## ✨ Features

- **⏱️ Live Scrape Countdown Widget:** A persistent bottom-right brutalist toast counting down to the exact 15-minute cron mark (`:00`, `:15`, `:30`, `:45`). Minimizable with one click.
- **🔄 Zero-Reload Silent Sync:** When the countdown hits `00M 00S`, the frontend quietly fetches fresh data from Supabase in the background without refreshing the page, resetting scroll position, or clearing active filters.
- **🆕 New Drops Detection:** Automatically flags newly added problem statements discovered within the last 24–48 hours with a bold `NEW DROP` badge and a dedicated one-click recency filter.
- **🎯 Niche PS View:** Direct sorting by lowest submissions first, highlighting untapped problem statements with 0 to 5 submissions.
- **🔍 Multi-Dimensional Filtering:**
  - Search by Title, PS Number (e.g., `SIH26001`), Ministry / Organization, or Theme.
  - Filter by Category (`ALL`, `SOFTWARE`, `HARDWARE`).
  - Submission caps (`ALL`, `0 IDEAS`, `≤ 5`, `≤ 10`, `≤ 20`).
  - Multi-sort logic: Lowest Competition, Most Popular, Newest Drops First, Recently Updated, PS ID, and Alphabetical.
- **🎨 Neo-Brutalist Design System:** Custom high-contrast aesthetic with `#121214` Deep Jet Black borders, hard drop shadows, custom Minecraft typography, and reactive Light / Dark modes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Neo-brutalist Vanilla CSS with custom design tokens
- **Typography:** Minecraft Regular & Bold
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Deployment:** Vercel

### Data Pipeline & Scraper
- **Runtime:** Python 3.12 (Running 24/7 on AWS EC2 Mumbai `ap-south-1`)
- **HTTP Client:** `curl_cffi` (Chrome 124 TLS/JA3 fingerprint impersonation to bypass Azure WAF)
- **Parser:** BeautifulSoup4 + lxml
- **Database Client:** Supabase Python Client (PostgREST)

### Database & Backend
- **Database:** Supabase (Hosted PostgreSQL)
- **Tables:**
  - `problem_statements`: Upserted table containing title, category, theme, ministry, idea counts, and timestamps.
  - `history_log`: Append-only audit log tracking changes in submission counts over time.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/rohanbagel/Niche_SIH.git
cd Niche_SIH
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (see `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Start the local development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

---

### 3. Scraper Setup (Optional / Local Run)
```bash
# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r scripts/requirements.txt
```

Set environment variables:
```bash
# On Linux/macOS
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# On Windows (PowerShell)
$env:SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Run the scraper:
```bash
python scripts/scrape.py
```

---

## 🔒 Security

- **Strict Key Separation:** The frontend repository only uses the public Supabase `anon` key, scoped via PostgreSQL Row Level Security (RLS) for read-only access.
- **Admin Keys Isolated:** The privileged `service_role` key is strictly loaded via environment variables on the isolated AWS EC2 scraper instance and is never stored in code or repository commits.
- **Protected Environment:** All `.env`, private keys (`.pem`, `.key`), and infrastructure documents are strictly ignored in `.gitignore`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
