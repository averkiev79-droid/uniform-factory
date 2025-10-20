from database_sqlite import get_db, SQLProduct, ProductCategory

db = next(get_db())
total = db.query(SQLProduct).count()
print(f'Всего товаров в базе: {total}')
print('\nТоваров по категориям:')
for cat in db.query(ProductCategory).all():
    count = db.query(SQLProduct).filter(SQLProduct.category_id == str(cat.id)).count()
    print(f'  {cat.title}: {count} товаров')

# Проверим товары с артикулами
products_with_articles = db.query(SQLProduct).filter(SQLProduct.article != '').count()
print(f'\nТоваров с артикулами: {products_with_articles}')
