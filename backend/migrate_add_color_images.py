#!/usr/bin/env python3
"""
Migration script to add color_images column to products table
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
        
        if 'color_images' not in columns:
            print("Adding color_images column to products table...")
            cursor.execute("""
                ALTER TABLE products 
                ADD COLUMN color_images TEXT
            """)
            
            # Migrate existing colors to new format with null images
            cursor.execute("SELECT id, colors FROM products WHERE colors IS NOT NULL")
            products = cursor.fetchall()
            
            for product_id, colors_json in products:
                if colors_json:
                    try:
                        colors = json.loads(colors_json)
                        # Convert simple color array to color objects with images
                        color_images = [
                            {
                                "color": color,
                                "image": None,
                                "preview": None
                            }
                            for color in colors
                        ]
                        cursor.execute("""
                            UPDATE products 
                            SET color_images = ?
                            WHERE id = ?
                        """, (json.dumps(color_images), product_id))
                    except:
                        pass
            
            conn.commit()
            print(f"✅ Successfully added color_images column")
            print(f"✅ Migrated {len(products)} products")
        else:
            print("⚠️ Column color_images already exists")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
