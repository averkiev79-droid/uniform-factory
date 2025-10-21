#!/usr/bin/env python3
"""
Migration: Add on_order field to products table
This adds ability to mark products as "Made to Order" status
"""

from database_sqlite import SessionLocal, SQLProduct
from sqlalchemy import text

def migrate_add_on_order():
    """Add on_order column to products table"""
    db = SessionLocal()
    
    try:
        print("=== Adding on_order field to products ===\n")
        
        # Check if column already exists
        result = db.execute(text("PRAGMA table_info(products)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'on_order' in columns:
            print("✓ Column 'on_order' already exists. Skipping migration.")
            return
        
        # Add the column
        print("Adding 'on_order' column...")
        db.execute(text("ALTER TABLE products ADD COLUMN on_order BOOLEAN DEFAULT 0"))
        db.commit()
        
        print("✓ Column added successfully")
        
        # Verify
        total_products = db.query(SQLProduct).count()
        print(f"\n✅ Migration completed!")
        print(f"   Total products: {total_products}")
        print(f"   All products now have on_order field (default: False)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    migrate_add_on_order()
