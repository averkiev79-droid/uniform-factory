#!/usr/bin/env python3
"""
Migration script to remove "Без нанесения" from branding_options
"""

import sqlite3
import json

def migrate():
    conn = sqlite3.connect('/app/backend/avik_uniform.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, branding_options FROM products WHERE branding_options IS NOT NULL")
        products = cursor.fetchall()
        
        updated_count = 0
        for product_id, branding_json in products:
            if branding_json:
                try:
                    branding_list = json.loads(branding_json)
                    # Filter out "Без нанесения"
                    filtered_branding = [
                        b for b in branding_list 
                        if isinstance(b, dict) and b.get('type', '').lower() != 'без нанесения'
                    ]
                    
                    # Update if something was removed
                    if len(filtered_branding) != len(branding_list):
                        cursor.execute("""
                            UPDATE products 
                            SET branding_options = ?
                            WHERE id = ?
                        """, (json.dumps(filtered_branding), product_id))
                        updated_count += 1
                except Exception as e:
                    print(f"Error processing product {product_id}: {e}")
        
        conn.commit()
        print(f"✅ Successfully removed 'Без нанесения' from {updated_count} products")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
