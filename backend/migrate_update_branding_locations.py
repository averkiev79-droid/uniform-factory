#!/usr/bin/env python3
"""
Migration script to update branding locations:
1. Change "Грудь слева" to "Грудь"
2. Add "Рукав" location
"""

import sqlite3
import json
from datetime import datetime

def migrate_branding_locations():
    conn = sqlite3.connect('avik_uniform.db')
    cursor = conn.cursor()
    
    print(f"\n{'='*60}")
    print(f"MIGRATION: Update Branding Locations")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    # Get all products with branding_options
    cursor.execute("SELECT id, name, branding_options FROM products WHERE branding_options IS NOT NULL AND branding_options != '[]'")
    products = cursor.fetchall()
    
    print(f"Found {len(products)} products with branding options\n")
    
    updated_count = 0
    
    for product_id, product_name, branding_json in products:
        try:
            branding_options = json.loads(branding_json)
            updated = False
            
            # Update each branding type
            for branding_type in branding_options:
                if 'locations' in branding_type and branding_type['locations']:
                    new_locations = []
                    
                    for location in branding_type['locations']:
                        # Change "Грудь слева" to "Грудь"
                        if location['name'] == 'Грудь слева':
                            location['name'] = 'Грудь'
                            updated = True
                        new_locations.append(location)
                    
                    # Add "Рукав" if not exists
                    has_sleeve = any(loc['name'] == 'Рукав' for loc in new_locations)
                    if not has_sleeve:
                        new_locations.append({
                            "name": "Рукав",
                            "size": "8×8",
                            "price": 100
                        })
                        updated = True
                    
                    branding_type['locations'] = new_locations
            
            if updated:
                # Update product in database
                updated_json = json.dumps(branding_options, ensure_ascii=False)
                cursor.execute(
                    "UPDATE products SET branding_options = ? WHERE id = ?",
                    (updated_json, product_id)
                )
                updated_count += 1
                print(f"✅ Updated: {product_name[:50]}")
                
        except Exception as e:
            print(f"❌ Error updating {product_name}: {str(e)}")
            continue
    
    conn.commit()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"Migration completed!")
    print(f"Updated {updated_count} products")
    print(f"{'='*60}\n")
    
    return updated_count

if __name__ == "__main__":
    migrate_branding_locations()
