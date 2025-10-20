#!/usr/bin/env python3
"""
Скрипт для обновления описаний товаров - повторный парсинг с сайта aviktime.ru
"""

import sys
import os
import re
import requests
from bs4 import BeautifulSoup
import time

sys.path.append(os.path.dirname(__file__))

from database_sqlite import get_db, SQLProduct


def get_product_url_by_article(article: str) -> str:
    """Генерирует примерный URL товара по артикулу (попытка)"""
    # К сожалению, нет прямой связи артикул -> URL
    # Поэтому будем искать через поиск
    return None


def parse_clean_description(html: str) -> str:
    """Парсит ТОЛЬКО описание изделия из HTML"""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Ищем текст "Описание изделия:"
    desc_marker = soup.find(string=re.compile(r'Описание изделия:', re.IGNORECASE))
    
    if not desc_marker:
        return "Подробную информацию уточняйте у менеджера"
    
    # Получаем родительский элемент
    parent = desc_marker.find_parent()
    if not parent:
        return "Подробную информацию уточняйте у менеджера"
    
    # Собираем текст, идущий после "Описание изделия:"
    description_parts = []
    found_marker = False
    
    # Проходим по всем текстовым узлам родителя
    for content in parent.descendants:
        if isinstance(content, str):
            text = content.strip()
            
            if 'Описание изделия' in text:
                found_marker = True
                # Берём текст после маркера в той же строке
                after_marker = text.split('Описание изделия:', 1)
                if len(after_marker) > 1 and after_marker[1].strip():
                    description_parts.append(after_marker[1].strip())
                continue
            
            if found_marker and text:
                # Останавливаемся, если встретили артикул, размеры или другие метки
                if any(marker in text for marker in ['ДИ', 'Артикул:', '**', 'возможен пошив', 'Предварительный']):
                    break
                    
                description_parts.append(text)
    
    description = ' '.join(description_parts).strip()
    
    # Очистка от лишнего
    description = re.sub(r'\s+', ' ', description)  # Убираем множественные пробелы
    description = description.replace('возможен пошив в любой цветовой гамме', '').strip()
    
    if not description or len(description) < 10:
        return "Подробную информацию уточняйте у менеджера"
    
    return description


def update_product_descriptions():
    """Обновляет описания товаров, очищая их от лишнего текста"""
    db = next(get_db())
    
    try:
        # Получаем все товары с плохими описаниями (содержат "Звонок с сайта", "Индивидуальный расчет" и т.п.)
        products = db.query(SQLProduct).filter(
            SQLProduct.article != ''
        ).all()
        
        print(f"Найдено товаров для проверки: {len(products)}")
        print()
        
        updated_count = 0
        skipped_count = 0
        
        for idx, product in enumerate(products, 1):
            print(f"[{idx}/{len(products)}] {product.name} (арт. {product.article})")
            
            # Проверяем, нужно ли обновлять
            needs_update = any(marker in product.description for marker in [
                'Звонок с сайта', 'Индивидуальный расчет', 'Очистить', 
                'вопрос руководству', 'ПОДТВЕРДИТЬ'
            ])
            
            if needs_update or len(product.description) > 300:
                # Устанавливаем стандартное описание
                product.description = "Подробную информацию о модели, размерах и составе ткани уточняйте у менеджера."
                updated_count += 1
                print(f"  ✓ Очищено")
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
