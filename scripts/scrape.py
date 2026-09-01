#!/usr/bin/env python3
"""
Niche SIH Scraper — Tracks submission counts per SIH 2026 Problem Statement.

Scrapes https://sih.gov.in/sih2026PS, extracts the full PS table with idea
counts, diffs against previous state, and writes:
  data/latest.json        — current snapshot of all PS with metadata
  data/history/YYYY-MM-DD.jsonl  — append-only log of changes for that day

Designed to run on GitHub Actions cron every 10-15 minutes.
Uses curl subprocess for TLS fingerprint compatibility with Azure WAF.

Usage:
  python scripts/scrape.py              # fetch live + update data files
  python scripts/scrape.py --dry-run    # fetch + parse but don't write files
"""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("beautifulsoup4 is required: pip install beautifulsoup4 lxml")

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
HISTORY_DIR = DATA_DIR / "history"
LATEST_FILE = DATA_DIR / "latest.json"
SCRAPE_LOG = DATA_DIR / "scrape_log.jsonl"

URL = "https://sih.gov.in/sih2026PS"
IST = timezone(timedelta(hours=5, minutes=30))

# Minimum expected records — if we get fewer, something went wrong
MIN_RECORDS = 200

# ── Mojibake fix table ─────────────────────────────────────────────────────
# The SIH portal serves CP1252-double-encoded UTF-8. These are the most
# common broken sequences mapped to their correct Unicode characters.
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
    """Fetch HTML using curl with browser-like TLS fingerprint.

    The SIH portal sits behind an Azure Application Gateway / WAF that
    blocks Python urllib/requests from CI runners. curl's TLS fingerprint
    matches real browsers much better, so we shell out to it.
    """
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

            # Sanity check — the PS table should be present
            if "dataTablePS" not in html_text and "<table" not in html_text:
                snippet = html_text[:300].replace("\n", " ")
                print(f"  ⚠ Response missing expected table "
                      f"(snippet: {snippet[:200]}...)")

            return html_text

        except Exception as e:
            last_err = e
            if attempt < max_attempts - 1:
                wait = min(10 * (2 ** attempt), 60)  # 10, 20, 40, 60, 60
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
    """Parse 'X/500' format into the integer X.

    Examples:
        '0/500' → 0
        '12/500' → 12
        '500/500' → 500
        'No Ideas Submitted' → 0
    """
    if not ideas_str:
        return 0
    match = re.match(r"(\d+)\s*/\s*\d+", ideas_str.strip())
    if match:
        return int(match.group(1))
    # Try extracting any number
    digits = re.findall(r"\d+", ideas_str)
    if digits:
        return int(digits[0])
    return 0


def parse_ps_table(html_text: str) -> list[dict]:
    """Parse the problem statements table from the SIH HTML page.

    The table has id='dataTablePS'. Each PS row has 18 <td> cells because
    the page embeds an expandable detail panel inside each row:

    Cell Index | Field
    -----------|------
     0         | S.No.
     1         | Organization
     2         | Title (with modal content mixed in — use cell 4 instead)
     3         | PS ID number (just the numeric part, e.g. '26001')
     4         | Clean title
     5         | Description (full text)
     6         | Organization (repeated)
     7         | Department
     8         | Category (in detail section)
     9         | Theme (in detail section)
    10         | YouTube link
    11         | Dataset link
    12         | Contact info
    13         | Category (clean, in summary row)
    14         | PS Number (full: 'SIH26001')
    15         | Ideas Count ('X/500') ← the key field we track
    16         | Theme (clean, in summary row)
    17         | Deadline
    """
    soup = BeautifulSoup(html_text, "lxml")

    # Try to find the main PS table
    table = soup.find("table", {"id": "dataTablePS"})
    if not table:
        # Fallback: look for any large table with many rows
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

        # PS rows have 18 cells; skip header rows, detail sub-rows, etc.
        if len(cells) < 14:
            continue

        try:
            # Check if cell[14] contains a valid PS number (SIH26XXX)
            ps_number_raw = cells[14].get_text(strip=True) if len(cells) > 14 else ""
            if not re.match(r"SIH\d{5}", ps_number_raw):
                continue  # Not a PS row

            ps_number = ps_number_raw

            # Extract fields from their correct cell indices
            sno_text = fix_text(cells[0].get_text(strip=True))
            org = fix_text(cells[1].get_text(strip=True))
            title = fix_text(cells[4].get_text(strip=True))  # Clean title
            description = fix_text(cells[5].get_text(strip=True))
            department = fix_text(cells[7].get_text(strip=True))
            category = fix_text(cells[13].get_text(strip=True))
            ideas_raw = fix_text(cells[15].get_text(strip=True))
            theme = fix_text(cells[16].get_text(strip=True))
            deadline = fix_text(cells[17].get_text(strip=True))

            # YouTube, dataset, contact links (may be empty)
            youtube = fix_text(cells[10].get_text(strip=True)) if len(cells) > 10 else ""
            dataset_link = fix_text(cells[11].get_text(strip=True)) if len(cells) > 11 else ""
            contact = fix_text(cells[12].get_text(strip=True)) if len(cells) > 12 else ""

            # Also grab any <a> href from dataset cell
            dataset_a = cells[11].find("a") if len(cells) > 11 else None
            if dataset_a and dataset_a.get("href"):
                dataset_link = dataset_a["href"]

            # Parse S.No.
            try:
                sno = int(re.sub(r"[^\d]", "", sno_text))
            except (ValueError, IndexError):
                sno = 0

            # Parse idea count from "X/500" format
            ideas_count = parse_ideas_count(ideas_raw)

            # Parse the max ideas if present (the /500 part)
            max_match = re.search(r"/\s*(\d+)", ideas_raw)
            max_ideas = int(max_match.group(1)) if max_match else 500

            record = {
                "sno": sno,
                "psNumber": ps_number,
                "title": title,
                "org": org,
                "department": department,
                "category": category,
                "theme": theme,
                "deadline": deadline,
                "ideasCount": ideas_count,
                "maxIdeas": max_ideas,
                "ideasRaw": ideas_raw,
            }

            # Only add large fields if they have content (keeps JSON smaller)
            if description:
                record["description"] = description
            if youtube:
                record["youtubeLink"] = youtube
            if dataset_link:
                record["datasetLink"] = dataset_link
            if contact:
                record["contact"] = contact

            records.append(record)

        except (IndexError, AttributeError) as e:
            print(f"  Warning: Skipping malformed row: {e}")
            continue

    return records


# ── Diffing ────────────────────────────────────────────────────────────────

def load_latest() -> list[dict]:
    """Load the previous latest.json snapshot."""
    if LATEST_FILE.exists():
        try:
            return json.loads(LATEST_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return []
    return []


def compute_diff(
    current: list[dict],
    previous: list[dict],
) -> tuple[list[dict], list[dict], list[dict]]:
    """Diff current scrape against previous snapshot.

    Returns:
        new_ps: PS IDs not seen before
        changed_ps: PS where ideasCount changed
        unchanged_ps: PS with no change
    """
    prev_map = {r["psNumber"]: r for r in previous}
    curr_map = {r["psNumber"]: r for r in current}

    new_ps = []
    changed_ps = []
    unchanged_ps = []

    for ps_id, record in curr_map.items():
        if ps_id not in prev_map:
            new_ps.append(record)
        elif record["ideasCount"] != prev_map[ps_id]["ideasCount"]:
            changed_ps.append({
                **record,
                "_prevCount": prev_map[ps_id]["ideasCount"],
            })
        else:
            unchanged_ps.append(record)

    return new_ps, changed_ps, unchanged_ps


# ── Writing ────────────────────────────────────────────────────────────────

def write_latest(records: list[dict], previous: list[dict], now: datetime):
    """Write the latest.json snapshot with metadata."""
    prev_map = {r["psNumber"]: r for r in previous}

    enriched = []
    for r in records:
        prev = prev_map.get(r["psNumber"])
        enriched.append({
            **r,
            "firstSeenAt": (
                prev.get("firstSeenAt", now.isoformat())
                if prev else now.isoformat()
            ),
            "lastUpdatedAt": (
                now.isoformat()
                if not prev or r["ideasCount"] != prev.get("ideasCount")
                else prev.get("lastUpdatedAt", now.isoformat())
            ),
        })

    # Sort by PS number for stable diffs
    enriched.sort(key=lambda r: r["psNumber"])

    LATEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    LATEST_FILE.write_text(
        json.dumps(enriched, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return enriched


def write_history(
    new_ps: list[dict],
    changed_ps: list[dict],
    now: datetime,
):
    """Append change events to today's history JSONL file."""
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    today_file = HISTORY_DIR / f"{now.strftime('%Y-%m-%d')}.jsonl"

    events = []
    ts = now.isoformat()

    for r in new_ps:
        events.append({
            "timestamp": ts,
            "psNumber": r["psNumber"],
            "title": r["title"],
            "count": r["ideasCount"],
            "changeType": "new",
        })

    for r in changed_ps:
        events.append({
            "timestamp": ts,
            "psNumber": r["psNumber"],
            "title": r["title"],
            "count": r["ideasCount"],
            "prevCount": r.get("_prevCount", 0),
            "changeType": "count_changed",
        })

    if events:
        with open(today_file, "a", encoding="utf-8") as f:
            for event in events:
                f.write(json.dumps(event, ensure_ascii=False) + "\n")

    return events


def write_scrape_log(now: datetime, record_count: int, changes: int):
    """Append a lightweight log entry for every run (even no-change runs)."""
    entry = {
        "timestamp": now.isoformat(),
        "recordCount": record_count,
        "changesDetected": changes,
    }
    with open(SCRAPE_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Niche SIH Scraper")
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Fetch and parse but don't write any files"
    )
    parser.add_argument(
        "--cache", type=str, metavar="FILE",
        help="Parse a local cached HTML file instead of fetching live"
    )
    args = parser.parse_args()

    now = datetime.now(IST)
    print(f"🕐 Niche SIH Scraper — {now.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print(f"   Target: {URL}")

    # ── Fetch or load cached HTML ──
    if args.cache:
        print(f"   📂 Loading cached HTML from {args.cache}")
        html_text = Path(args.cache).read_text(encoding="utf-8", errors="replace")
    else:
        print("   🌐 Fetching live page...")
        html_text = fetch_html(URL)

    print(f"   📄 Got {len(html_text):,} bytes of HTML")

    # ── Parse ──
    print("   🔍 Parsing problem statements table...")
    records = parse_ps_table(html_text)
    print(f"   ✓ Found {len(records)} problem statements")

    if len(records) < MIN_RECORDS:
        print(f"   ✗ FAIL: Expected at least {MIN_RECORDS} records, "
              f"got {len(records)}. Aborting to avoid data loss.")
        sys.exit(1)

    # Show category breakdown
    sw = sum(1 for r in records if r["category"].lower() == "software")
    hw = sum(1 for r in records if r["category"].lower() == "hardware")
    print(f"   📊 {sw} Software + {hw} Hardware = {len(records)} total")

    # Show ideas stats
    total_ideas = sum(r["ideasCount"] for r in records)
    with_ideas = sum(1 for r in records if r["ideasCount"] > 0)
    print(f"   💡 {total_ideas} total ideas submitted across {with_ideas} PS "
          f"(out of {len(records)})")

    # ── Diff ──
    previous = load_latest()
    new_ps, changed_ps, unchanged_ps = compute_diff(records, previous)

    print(f"\n   📋 Diff against previous snapshot:")
    print(f"      🆕 New PS:      {len(new_ps)}")
    print(f"      📈 Changed:     {len(changed_ps)}")
    print(f"      ─  Unchanged:   {len(unchanged_ps)}")

    if new_ps:
        print(f"\n   🆕 New problem statements:")
        for r in new_ps:
            print(f"      • {r['psNumber']}: {r['title'][:70]}")

    if changed_ps:
        print(f"\n   📈 Count changes:")
        for r in changed_ps:
            print(f"      • {r['psNumber']}: {r.get('_prevCount', '?')} → "
                  f"{r['ideasCount']}  ({r['title'][:50]})")

    total_changes = len(new_ps) + len(changed_ps)

    if args.dry_run:
        print("\n   🏁 Dry run — no files written.")
        return

    # ── Write files ──
    print("\n   💾 Writing data files...")

    # Always write latest.json (updates firstSeenAt/lastUpdatedAt timestamps)
    enriched = write_latest(records, previous, now)
    print(f"      ✓ data/latest.json ({len(enriched)} records)")

    # Write history only if there are changes
    if total_changes > 0:
        events = write_history(new_ps, changed_ps, now)
        today = now.strftime("%Y-%m-%d")
        print(f"      ✓ data/history/{today}.jsonl ({len(events)} events)")
    else:
        print(f"      ─ No changes, history not updated")

    # Always log the scrape run
    write_scrape_log(now, len(records), total_changes)
    print(f"      ✓ data/scrape_log.jsonl (run logged)")

    # ── Summary for GitHub Actions ──
    # Write to GITHUB_OUTPUT if available (for commit-only-on-change logic)
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"changes_detected={'true' if total_changes > 0 else 'false'}\n")
            f.write(f"record_count={len(records)}\n")
            f.write(f"new_count={len(new_ps)}\n")
            f.write(f"changed_count={len(changed_ps)}\n")

    has_changes = "YES" if total_changes > 0 else "NO"
    print(f"\n   🏁 Done! Changes detected: {has_changes}")


if __name__ == "__main__":
    main()
