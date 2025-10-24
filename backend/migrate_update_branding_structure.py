#!/usr/bin/env python3
"""
Migration script to update branding_options structure to include placement locations
"""

import sqlite3
import json

def migrate():
    conn = sqlite3.connect('/app/backend/avik_uniform.db')
    cursor = conn.cursor()
    
    try:
        # Update existing branding_options to new structure
        cursor.execute("SELECT id, branding_options FROM products WHERE branding_options IS NOT NULL")
        products = cursor.fetchall()
        
        updated_count = 0
        for product_id, branding_json in products:
            if branding_json:
                try:
                    branding_list = json.loads(branding_json)
                    # Check if it's old format (simple array)
                    if branding_list and isinstance(branding_list[0], str):
                        # Convert to new format with locations
                        new_branding = []
                        for branding_type in branding_list:
                            new_branding.append({
                                "type": branding_type,
                                "locations": [
                                    {"name": "Грудь слева", "size": "10×10", "price": 150},
                                    {"name": "Спина", "size": "30×30", "price": 300}
                                ]
                            })
                        
                        cursor.execute("""
                            UPDATE products 
                            SET branding_options = ?
                            WHERE id = ?
                        """, (json.dumps(new_branding), product_id))
                        updated_count += 1
                except Exception as e:
                    print(f"Error processing product {product_id}: {e}")
        
        conn.commit()
        print(f"✅ Successfully updated {updated_count} products with new branding structure")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
