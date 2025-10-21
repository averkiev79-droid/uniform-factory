#!/usr/bin/env python3
"""
Database migration: Add article numbers to products on production
Run this script on production server after deploying code updates
"""

from database_sqlite import SessionLocal, SQLProduct

def migrate_add_articles():
    """
    Add article numbers to existing products
    This script can be run multiple times safely (idempotent)
    """
    db = SessionLocal()
    
    try:
        # Article mapping for manually created products
        MANUAL_ARTICLES = {
            "Белая рубашка для официантов": "WS-001",
            "Фартук для официантов премиум": "AP-101",
            "Женский деловой костюм-тройка": "WS-201",
            "Мужская деловая рубашка Slim Fit": "MS-101",
            "Поло для продавцов-консультантов": "PS-301",
            "Классическая блуза женская": "WB-401",
            "Корпоративная толстовка с логотипом": "CS-501",
            "Джинсовый фартук для барист": "BA-601",
            "Яркая промо-футболка": "PT-701",
            "Медицинский костюм премиум": "MC-801",
            "Рабочий костюм усиленный": "WS-901"
        }
        
        print("=== Starting article migration ===\n")
        
        # Get all products
        products = db.query(SQLProduct).all()
        total_products = len(products)
        
        print(f"Total products in database: {total_products}")
        
        # Count existing articles
        with_articles = sum(1 for p in products if p.article)
        without_articles = total_products - with_articles
        
        print(f"Products with articles: {with_articles}")
        print(f"Products without articles: {without_articles}\n")
        
        if without_articles == 0:
            print("✅ All products already have articles. No migration needed.")
            return
        
        # Add articles to products without them
        updated_count = 0
        
        for product in products:
            # Skip if already has article
            if product.article:
                continue
                
            # Check if it's a manually created product
            if product.name in MANUAL_ARTICLES:
                product.article = MANUAL_ARTICLES[product.name]
                updated_count += 1
                print(f"✓ Updated manual product: '{product.name}' → {product.article}")
        
        # Commit changes
        if updated_count > 0:
            db.commit()
            print(f"\n✅ Successfully updated {updated_count} products with article numbers")
        else:
            print("\nℹ️ No updates needed. All manual products already have articles.")
        
        # Final statistics
        print("\n=== Final Statistics ===")
        products_after = db.query(SQLProduct).all()
        with_articles_after = sum(1 for p in products_after if p.article)
        print(f"Total products: {len(products_after)}")
        print(f"Products with articles: {with_articles_after} ({with_articles_after/len(products_after)*100:.1f}%)")
        print(f"Products without articles: {len(products_after) - with_articles_after}")
        
        print("\n=== Migration completed successfully! ===")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print(__doc__)
    migrate_add_articles()
