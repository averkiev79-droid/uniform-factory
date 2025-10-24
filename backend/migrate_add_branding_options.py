#!/usr/bin/env python3
"""
Migration script to add branding_options column to products table
"""

import sqlite3
import json

def migrate():
    conn = sqlite3.connect('/app/backend/avik_uniform.db')
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(products)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'branding_options' not in columns:
            print("Adding branding_options column to products table...")
            cursor.execute("""
                ALTER TABLE products 
                ADD COLUMN branding_options TEXT
            """)
            
            # Set default branding options for existing products
            default_branding = json.dumps([
                "Вышивка",
                "Шелкография", 
                "Термопечать"
            ])
            
            cursor.execute("""
                UPDATE products 
                SET branding_options = ?
                WHERE branding_options IS NULL
            """, (default_branding,))
            
            conn.commit()
            print(f"✅ Successfully added branding_options column")
            print(f"✅ Updated {cursor.rowcount} products with default branding options")
        else:
            print("⚠️ Column branding_options already exists")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
