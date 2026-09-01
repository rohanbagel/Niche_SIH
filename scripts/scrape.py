#!/usr/bin/env python3
"""
Niche SIH Scraper — Tracks submission counts per SIH 2026 Problem Statement.

Scrapes https://sih.gov.in/sih2026PS, extracts the full PS table with idea
counts, diffs against previous state fetched from Supabase, and writes:
  problem_statements table (upsert)
  history_log table (insert for new changes)

Designed to run on GitHub Actions cron every 15 minutes.
Uses curl subprocess for TLS fingerprint compatibility with Azure WAF.
"""

import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone, timedelta

try:
    from bs4 import BeautifulSoup
    from supabase import create_client, Client
except ImportError:
    sys.exit("dependencies missing: pip install beautifulsoup4 lxml supabase")

# ── Configuration ──────────────────────────────────────────────────────────

URL = "https://sih.gov.in/sih2026PS"
IST = timezone(timedelta(hours=5, minutes=30))
MIN_RECORDS = 200

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Operating in dry-run mode.")

# ── Mojibake fix table ─────────────────────────────────────────────────────

MOJIBAKE_FIX = {
    "\u00e2\u20ac\u201c": "\u2013",   # en dash
    "\u00e2\u20ac\u201d": "\u2014",   # em dash
    "\u00e2\u20ac\u2122": "\u2019",   # right single quote
    "\u00e2\u20ac\u02dc": "\u2018",   # left single quote
    "\u00e2\u20ac\u0153": "\u201c",   # left double quote
    "\u00e2\u20ac\u0152": "\u201d",   # right double quote (non-standard)
    "\u00e2\u20ac\u00a6": "\u2026",   # ellipsis
    "\u00c2\u00b0": "\u00b0",         # degree sign
    "\u00c2\u00b5": "\u00b5",         # micro sign
    "\u00c2\u00b7": "\u00b7",         # middle dot
    "\u00c3\u00b1": "\u00f1",         # n-tilde
    "\u00c3\u00a0": "\u00e0",         # a-grave
    "\u00c3\u00a9": "\u00e9",         # e-acute
}

PUNCTUATION_NORMALIZE = {
    "\u2014": "-",   # em dash → hyphen
    "\u2013": "-",   # en dash → hyphen
}


def fix_text(text: str) -> str:
    """Fix mojibake and normalize punctuation in scraped text."""
    for bad, good in MOJIBAKE_FIX.items():
        text = text.replace(bad, good)
    for bad, good in PUNCTUATION_NORMALIZE.items():
        text = text.replace(bad, good)
    return text.strip()


# ── Fetching ───────────────────────────────────────────────────────────────

def fetch_html(url: str, max_attempts: int = 5) -> str:
    """Fetch HTML using curl with browser-like TLS fingerprint."""
    cmd = [
        "curl", "-sS", "-L",
        "--max-time", "90",
        "--compressed",
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
              "AppleWebKit/537.36 (KHTML, like Gecko) "
              "Chrome/126.0.0.0 Safari/537.36",
        "-H", "Accept: text/html,application/xhtml+xml,application/xml;"
              "q=0.9,image/avif,image/webp,*/*;q=0.8",
        "-H", "Accept-Language: en-US,en;q=0.9",
        "-H", "Referer: https://sih.gov.in/",
        "-H", "Sec-Fetch-Dest: document",
        "-H", "Sec-Fetch-Mode: navigate",
        "-H", "Sec-Fetch-Site: same-origin",
        "-H", 'Sec-Ch-Ua: "Chromium";v="126", "Google Chrome";v="126", '
              '"Not.A/Brand";v="99"',
        "-H", "Sec-Ch-Ua-Mobile: ?0",
        "-H", 'Sec-Ch-Ua-Platform: "Windows"',
        url,
    ]

    last_err = None
    for attempt in range(max_attempts):
        try:
            result = subprocess.run(
                cmd, capture_output=True, timeout=120
            )
            if result.returncode != 0:
                stderr = result.stderr.decode("utf-8", errors="replace").strip()
                raise RuntimeError(
                    f"curl exited {result.returncode}: {stderr}"
                )

            html_text = result.stdout.decode("utf-8", errors="replace")
            if not html_text.strip():
                raise RuntimeError("Empty response body")

            if "dataTablePS" not in html_text and "<table" not in html_text:
                snippet = html_text[:300].replace("\n", " ")
                print(f"  ⚠ Response missing expected table "
                      f"(snippet: {snippet[:200]}...)")

            return html_text

        except Exception as e:
            last_err = e
            if attempt < max_attempts - 1:
                wait = min(10 * (2 ** attempt), 60)
                print(f"  ✗ Attempt {attempt + 1}/{max_attempts} failed "
                      f"({e}); retrying in {wait}s")
                time.sleep(wait)
            else:
                print(f"  ✗ Attempt {attempt + 1}/{max_attempts} failed "
                      f"({e}); no more retries")

    raise RuntimeError(
        f"Could not fetch {url} after {max_attempts} attempts: {last_err}"
    )


# ── Parsing ────────────────────────────────────────────────────────────────

def parse_ideas_count(ideas_str: str) -> int:
    if not ideas_str:
        return 0
    match = re.match(r"(\d+)\s*/\s*\d+", ideas_str.strip())
    if match:
        return int(match.group(1))
    digits = re.findall(r"\d+", ideas_str)
    if digits:
        return int(digits[0])
    return 0


def parse_ps_table(html_text: str) -> list[dict]:
    soup = BeautifulSoup(html_text, "lxml")

    table = soup.find("table", {"id": "dataTablePS"})
    if not table:
        tables = soup.find_all("table")
        for t in tables:
            rows = t.find_all("tr")
            if len(rows) > MIN_RECORDS:
                table = t
                break

    if not table:
        raise RuntimeError(
            f"Could not find PS table in HTML "
            f"(found {len(soup.find_all('table'))} tables total)"
        )

    records = []
    rows = table.find_all("tr")

    for row in rows:
        cells = row.find_all("td")

        if len(cells) < 14:
            continue

        try:
            ps_number_raw = cells[14].get_text(strip=True) if len(cells) > 14 else ""
            if not re.match(r"SIH\d{5}", ps_number_raw):
                continue

            ps_number = ps_number_raw
            sno_text = fix_text(cells[0].get_text(strip=True))
            org = fix_text(cells[1].get_text(strip=True))
            title = fix_text(cells[4].get_text(strip=True))
            description = fix_text(cells[5].get_text(strip=True))
            department = fix_text(cells[7].get_text(strip=True))
            category = fix_text(cells[13].get_text(strip=True))
            ideas_raw = fix_text(cells[15].get_text(strip=True))
            theme = fix_text(cells[16].get_text(strip=True))
            deadline = fix_text(cells[17].get_text(strip=True))

            try:
                sno = int(re.sub(r"[^\d]", "", sno_text))
            except (ValueError, IndexError):
                sno = 0

            ideas_count = parse_ideas_count(ideas_raw)
            max_match = re.search(r"/\s*(\d+)", ideas_raw)
            max_ideas = int(max_match.group(1)) if max_match else 500

            record = {
                "sno": sno,
                "ps_number": ps_number,
                "title": title,
                "org": org,
                "department": department,
                "category": category,
                "theme": theme,
                "deadline": deadline,
                "ideas_count": ideas_count,
                "max_ideas": max_ideas,
                "description": description,
            }
            records.append(record)

        except (IndexError, AttributeError) as e:
            print(f"  Warning: Skipping malformed row: {e}")
            continue

    return records


# ── Supabase Integration ───────────────────────────────────────────────────

def load_previous_state(supabase: Client) -> list[dict]:
    """Fetch the current state from Supabase."""
    print("   🌐 Fetching existing state from Supabase...")
    try:
        response = supabase.table("problem_statements").select("ps_number, ideas_count, first_seen_at").execute()
        return response.data
    except Exception as e:
        print(f"   ✗ Error fetching from Supabase: {e}")
        return []


def process_supabase_sync(supabase: Client, records: list[dict], previous: list[dict], now: datetime):
    """Upsert records and log history to Supabase."""
    prev_map = {r["ps_number"]: r for r in previous}
    
    new_ps = []
    changed_ps = []
    unchanged_ps = []

    # Prepare upsert payload
    upsert_payload = []

    for r in records:
        ps_id = r["ps_number"]
        prev = prev_map.get(ps_id)

        first_seen_at = prev["first_seen_at"] if prev and prev.get("first_seen_at") else now.isoformat()
        
        upsert_record = {
            **r,
            "first_seen_at": first_seen_at,
            "last_updated_at": now.isoformat() if not prev or r["ideas_count"] != prev["ideas_count"] else prev.get("last_updated_at", now.isoformat())
        }
        upsert_payload.append(upsert_record)

        if not prev:
            new_ps.append(r)
        elif r["ideas_count"] != prev["ideas_count"]:
            changed_ps.append({**r, "_prev_count": prev["ideas_count"]})
        else:
            unchanged_ps.append(r)

    print(f"\n   📋 Diff against previous snapshot:")
    print(f"      🆕 New PS:      {len(new_ps)}")
    print(f"      📈 Changed:     {len(changed_ps)}")
    print(f"      ─  Unchanged:   {len(unchanged_ps)}")

    if not supabase:
        print("\n   🏁 No Supabase client initialized. Skipping database sync.")
        return

    # 1. Upsert Problem Statements
    print("\n   💾 Syncing problem_statements to Supabase...")
    try:
        # Supabase Python client currently requires passing data as a list for bulk upserts.
        # Chunking might be necessary if payload is huge, but 230 rows is fine.
        supabase.table("problem_statements").upsert(upsert_payload).execute()
        print(f"      ✓ Upserted {len(upsert_payload)} records")
    except Exception as e:
        print(f"      ✗ Error upserting problem statements: {e}")

    # 2. Insert History Logs
    history_payload = []
    ts = now.isoformat()

    for r in new_ps:
        history_payload.append({
            "ps_number": r["ps_number"],
            "change_type": "new",
            "old_count": 0,
            "new_count": r["ideas_count"],
            "created_at": ts
        })

    for r in changed_ps:
        history_payload.append({
            "ps_number": r["ps_number"],
            "change_type": "count_changed",
            "old_count": r["_prev_count"],
            "new_count": r["ideas_count"],
            "created_at": ts
        })

    if history_payload:
        print(f"   💾 Inserting {len(history_payload)} history logs...")
        try:
            supabase.table("history_log").insert(history_payload).execute()
            print("      ✓ History logs inserted")
        except Exception as e:
            print(f"      ✗ Error inserting history logs: {e}")


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Niche SIH Scraper (Supabase)")
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Fetch and parse but don't write any files"
    )
    args = parser.parse_args()

    now = datetime.now(IST)
    print(f"🕐 Niche SIH Scraper — {now.strftime('%Y-%m-%d %H:%M:%S %Z')}")

    # Initialize Supabase
    supabase = None
    if SUPABASE_URL and SUPABASE_KEY and not args.dry_run:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("   🌐 Fetching live page...")
    html_text = fetch_html(URL)
    print(f"   📄 Got {len(html_text):,} bytes of HTML")

    print("   🔍 Parsing problem statements table...")
    records = parse_ps_table(html_text)
    print(f"   ✓ Found {len(records)} problem statements")

    if len(records) < MIN_RECORDS:
        print(f"   ✗ FAIL: Expected at least {MIN_RECORDS} records, "
              f"got {len(records)}. Aborting to avoid data loss.")
        sys.exit(1)

    previous = []
    if supabase:
        previous = load_previous_state(supabase)

    process_supabase_sync(supabase, records, previous, now)
    print(f"\n   🏁 Done!")


if __name__ == "__main__":
    main()
