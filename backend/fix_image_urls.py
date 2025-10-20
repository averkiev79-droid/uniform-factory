#!/usr/bin/env python3
"""
Fix image URLs in database - replace full URLs with relative paths
"""
import sqlite3
import re

DB_PATH = '/app/backend/avik_uniform.db'

def fix_urls():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Pattern to match full URLs with domain
    pattern = r'https://[^/]+/api/uploads/'
    replacement = '/api/uploads/'
    
    tables_and_columns = [
        ('categories', 'image'),
        ('portfolio', 'image'),
        ('products', 'images'),
        ('app_settings', 'hero_image'),
        ('app_settings', 'hero_mobile_image'),
        ('app_settings', 'about_image'),
    ]
    
    total_updated = 0
    
    for table, column in tables_and_columns:
        try:
            # Get all rows with full URLs
            cursor.execute(f"SELECT id, {column} FROM {table} WHERE {column} LIKE 'https://%'")
            rows = cursor.fetchall()
            
            for row_id, url in rows:
                if url:
                    # Replace full URL with relative path
                    new_url = re.sub(pattern, replacement, url)
                    cursor.execute(f"UPDATE {table} SET {column} = ? WHERE id = ?", (new_url, row_id))
                    print(f"✅ Updated {table}.{column} (id={row_id}): {url} -> {new_url}")
                    total_updated += 1
        except sqlite3.OperationalError as e:
            print(f"⚠️  Skipping {table}.{column}: {e}")
            continue
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Total URLs updated: {total_updated}")
    return total_updated

if __name__ == '__main__':
    print("Starting URL fix...")
    fix_urls()
    print("Done!")
