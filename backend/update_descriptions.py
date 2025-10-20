#!/usr/bin/env python3
"""
Скрипт для обновления описаний товаров - удаление дубликатов и лишнего текста
"""

import sys
import os
import re

sys.path.append(os.path.dirname(__file__))

from database_sqlite import get_db, SQLProduct
from import_aviktime import parse_product_detail

def clean_description(description: str) -> str:
    """Очищает описание от дубликатов и лишнего текста"""
    if not description:
        return "Подробную информацию уточняйте у менеджера"
    
    # Удаляем повторяющиеся предложения
    sentences = description.split('.')
    unique_sentences = []
    seen = set()
    
    for sentence in sentences:
        clean_sent = sentence.strip().lower()
        if clean_sent and clean_sent not in seen and len(clean_sent) > 10:
            seen.add(clean_sent)
            unique_sentences.append(sentence.strip())
    
    result = '. '.join(unique_sentences)
    if result and not result.endswith('.'):
        result += '.'
    
    return result if result else "Подробную информацию уточняйте у менеджера"


def update_product_descriptions():
    """Обновляет описания товаров из источника"""
    db = next(get_db())
    
    try:
        # Получаем все товары с артикулами (импортированные с aviktime.ru)
        products = db.query(SQLProduct).filter(SQLProduct.article != '').all()
        
        print(f"Найдено товаров для обновления: {len(products)}")
        print()
        
        updated_count = 0
        skipped_count = 0
        
        for idx, product in enumerate(products, 1):
            print(f"[{idx}/{len(products)}] {product.name} (арт. {product.article})")
            
            # Очищаем текущее описание
            cleaned = clean_description(product.description)
            
            if cleaned != product.description:
                product.description = cleaned
                updated_count += 1
                print(f"  ✓ Обновлено")
            else:
                skipped_count += 1
                print(f"  - Без изменений")
        
        db.commit()
        
        print()
        print("=" * 80)
        print("ИТОГИ ОБНОВЛЕНИЯ")
        print("=" * 80)
        print(f"Обновлено: {updated_count}")
        print(f"Без изменений: {skipped_count}")
        print("=" * 80)
        
    finally:
        db.close()


if __name__ == "__main__":
    update_product_descriptions()
