#!/usr/bin/env python3
"""
Script to make all products available (unhide all products)
Use this to restore products after mass hide operation
"""

from database_sqlite import SessionLocal, SQLProduct
from datetime import datetime, timezone

def make_all_available():
    """Make all products available"""
    db = SessionLocal()
    
    try:
        print("=== Making all products available ===\n")
        
        # Get all hidden products
        hidden_products = db.query(SQLProduct).filter(SQLProduct.is_available == False).all()
        
        print(f"Found {len(hidden_products)} hidden products")
        
        if len(hidden_products) == 0:
            print("✓ All products are already available")
            return
        
        # Make them available
        for product in hidden_products:
            product.is_available = True
            product.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        
        print(f"✅ Successfully made {len(hidden_products)} products available")
        
        # Final stats
        total = db.query(SQLProduct).count()
        available = db.query(SQLProduct).filter(SQLProduct.is_available == True).count()
        hidden = db.query(SQLProduct).filter(SQLProduct.is_available == False).count()
        
        print(f"\n=== Final Statistics ===")
        print(f"Total products: {total}")
        print(f"Available: {available} ({available/total*100:.1f}%)")
        print(f"Hidden: {hidden} ({hidden/total*100:.1f}%)")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    response = input("This will make ALL products available. Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        make_all_available()
    else:
        print("Cancelled")
