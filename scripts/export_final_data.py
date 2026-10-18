#!/usr/bin/env python3
"""
Export Final SIH 2026 PS Data from Supabase.
Fetches all 265 problem statements with their final submission counts and metadata,
and saves them to a clean JSON snapshot file.
"""

import os
import json
from datetime import datetime, timezone
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ukiwfmuirjtvsrljnlhw.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVraXdmbXVpcmp0dnNybGpubGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODIxMzMsImV4cCI6MjEwMzg1ODEzM30.ZFGW9MncfnuFSqTXhpKnavXxTyQs_NSZp8lbaKvYJkw")

def export_data():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("[INFO] Fetching final problem statements from Supabase...")
    
    response = client.table("problem_statements").select("*").order("ideas_count", desc=False).execute()
    records = response.data or []
    
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "final_sih_problem_statements.json")
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
        
    print(f"[OK] Successfully exported {len(records)} problem statements to {output_file}")

if __name__ == "__main__":
    export_data()
