#!/usr/bin/env python3
"""
Migration: Add article and views_count columns to products table
"""
import sqlite3

DB_PATH = './avik_uniform.db'

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Starting migration...")
    
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(products)")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Add article column if it doesn't exist
    if 'article' not in columns:
        print("Adding 'article' column...")
        cursor.execute("ALTER TABLE products ADD COLUMN article VARCHAR")
        print("✅ Added 'article' column")
    else:
        print("⚠️  'article' column already exists")
    
    # Add views_count column if it doesn't exist
    if 'views_count' not in columns:
        print("Adding 'views_count' column...")
        cursor.execute("ALTER TABLE products ADD COLUMN views_count INTEGER DEFAULT 0")
        print("✅ Added 'views_count' column")
    else:
        print("⚠️  'views_count' column already exists")
    
    conn.commit()
    conn.close()
    
    print("\n✅ Migration completed successfully!")

if __name__ == '__main__':
    migrate()
