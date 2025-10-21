#!/usr/bin/env python3
"""
Script to add article numbers to existing products
"""

from database_sqlite import SessionLocal, SQLProduct

# Article mapping for existing products
ARTICLE_MAPPING = {
    "Белая рубашка для официантов": "WS-001",
    "Фартук для официантов премиум": "AP-101",
    "Женский деловой костюм-тройка": "WS-201",
    "Мужская деловая рубашка Slim Fit": "MS-101",
    "Поло для продавцов-консультантов": "PS-301",
    "Классическая блуза женская": "WB-401",
    "Корпоративная толстовка с логотипом": "CS-501",
    "Джинсовый фартук для барист": "BA-601"
}

def add_articles():
    """Add article numbers to products"""
    db = SessionLocal()
    try:
        products = db.query(SQLProduct).all()
        
        updated_count = 0
        for product in products:
            if product.name in ARTICLE_MAPPING:
                old_article = product.article
                product.article = ARTICLE_MAPPING[product.name]
                updated_count += 1
                print(f"✓ Updated '{product.name}': {old_article} → {product.article}")
        
        db.commit()
        print(f"\n✅ Successfully updated {updated_count} products with article numbers")
        
        # Verify updates
        print("\n📋 Current products with articles:")
        products = db.query(SQLProduct).all()
        for p in products:
            print(f"   {p.article or '(no article)'} - {p.name}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_articles()
