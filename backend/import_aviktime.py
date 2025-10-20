#!/usr/bin/env python3
"""
Скрипт для импорта товаров с aviktime.ru в базу данных Uniform Factory
Импортирует товары БЕЗ изображений, но С артикулами, характеристиками и описаниями
"""

import requests
from bs4 import BeautifulSoup
import re
import time
import sys
import os
from typing import List, Dict, Optional

# Добавляем путь к backend для импорта модулей
sys.path.append(os.path.dirname(__file__))

from database_sqlite import get_db, SQLProduct, SQLProductCharacteristic
from sqlalchemy.orm import Session

# Категории для импорта
CATEGORIES_TO_IMPORT = {
    "Блузы и сорочки": "https://aviktime.ru/catalog/sorochki_i_bluzy/",
    "Брюки классические": "https://aviktime.ru/catalog/bryuki_klassicheskie/",
    "Жилеты классические, корсеты": "https://aviktime.ru/catalog/zhilety_klassicheskie/",
    "Жилеты рабочие": "https://aviktime.ru/catalog/zhilety_rabochie/",
    "Куртки, ветровки": "https://aviktime.ru/catalog/kurtki_vetrovki/",
    "Пиджаки, жакеты": "https://aviktime.ru/catalog/pidzhaki_zhakety/",
    "Фартуки, передники": "https://aviktime.ru/catalog/fartuki_peredniki_nakidki/",
}

# Маппинг категорий aviktime.ru на категории в нашей системе
CATEGORY_MAPPING = {
    "Блузы и сорочки": 1,  # Рубашки/Блузки
    "Брюки классические": 2,  # Костюмы (брюки как часть)
    "Жилеты классические, корсеты": 2,  # Костюмы
    "Жилеты рабочие": 2,  # Костюмы
    "Куртки, ветровки": 2,  # Костюмы (верхняя одежда)
    "Пиджаки, жакеты": 2,  # Костюмы
    "Фартуки, передники": 4,  # Фартуки
}


def get_page_html(url: str, max_retries: int = 3) -> Optional[str]:
    """Получает HTML страницы с повторными попытками"""
    for attempt in range(max_retries):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response.text
        except Exception as e:
            print(f"Ошибка при загрузке {url} (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
    return None


def parse_product_list(category_url: str) -> List[Dict]:
    """Парсит список товаров из категории"""
    html = get_page_html(category_url)
    if not html:
        return []
    
    soup = BeautifulSoup(html, 'html.parser')
    products = []
    
    # Ищем все карточки товаров
    product_cards = soup.find_all('div', class_=lambda x: x and 'item' in x.lower())
    if not product_cards:
        # Альтернативный поиск
        product_cards = soup.find_all('a', href=re.compile(r'/catalog/items/\d+/'))
    
    # Извлекаем данные из ссылок
    for link in soup.find_all('a', href=re.compile(r'/catalog/items/')):
        # Проверяем, есть ли название товара
        product_name_elem = link.find(text=True, recursive=False)
        if not product_name_elem:
            product_name_elem = link.get_text(strip=True)
        
        if not product_name_elem or len(product_name_elem.strip()) < 3:
            continue
            
        product_url = link.get('href')
        if not product_url.startswith('http'):
            product_url = 'https://aviktime.ru' + product_url
        
        # Ищем артикул рядом
        parent = link.find_parent()
        article = None
        if parent:
            article_elem = parent.find('strong', text=re.compile(r'Артикул:'))
            if article_elem:
                article = article_elem.next_sibling
                if article:
                    article = article.strip()
        
        products.append({
            'name': product_name_elem.strip(),
            'url': product_url,
            'article': article
        })
    
    # Убираем дубликаты по URL
    seen_urls = set()
    unique_products = []
    for product in products:
        if product['url'] not in seen_urls:
            seen_urls.add(product['url'])
            unique_products.append(product)
    
    print(f"Найдено {len(unique_products)} товаров в категории")
    return unique_products


def parse_product_detail(product_url: str) -> Optional[Dict]:
    """Парсит детальную информацию о товаре"""
    html = get_page_html(product_url)
    if not html:
        return None
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Название товара
    name_elem = soup.find('h1')
    name = name_elem.get_text(strip=True) if name_elem else "Товар без названия"
    
    # Артикул
    article = None
    article_elem = soup.find('strong', text=re.compile(r'Артикул:'))
    if article_elem and article_elem.next_sibling:
        article = article_elem.next_sibling.strip()
    
    # Описание
    description = ""
    desc_elem = soup.find(text=re.compile(r'Описание изделия:'))
    if desc_elem:
        desc_parent = desc_elem.find_parent()
        if desc_parent:
            # Получаем весь текст после "Описание изделия:"
            desc_text = desc_parent.get_text(strip=True)
            description = desc_text.replace('Описание изделия:', '').strip()
    
    # Если описания нет, ищем любой текстовый блок
    if not description:
        content_divs = soup.find_all('div')
        for div in content_divs:
            text = div.get_text(strip=True)
            if len(text) > 50 and 'описание' not in text.lower():
                description = text
                break
    
    # Цена (если есть)
    price = None
    price_elem = soup.find(text=re.compile(r'(\d+)\s*(руб|₽)'))
    if price_elem:
        price_match = re.search(r'(\d+)', price_elem)
        if price_match:
            try:
                price = float(price_match.group(1))
            except:
                pass
    
    # Характеристики
    characteristics = []
    
    # Размеры
    size_match = re.search(r'ДИ[^\d]*(\d+)\s*=\s*(\d+)\s*см', str(soup))
    if size_match:
        characteristics.append({
            'name': 'Длина изделия',
            'value': f"{size_match.group(2)} см (размер {size_match.group(1)})"
        })
    
    # Состав (если указан)
    material_keywords = ['хлопок', 'полиэстер', 'эластан', 'лен', 'шерсть']
    soup_text = soup.get_text().lower()
    for keyword in material_keywords:
        if keyword in soup_text:
            characteristics.append({
                'name': 'Состав',
                'value': 'Информация о составе доступна у менеджера'
            })
            break
    
    return {
        'name': name,
        'article': article,
        'description': description[:500] if description else "Подробную информацию уточняйте у менеджера",
        'price': price,
        'characteristics': characteristics
    }


def import_product_to_db(db: Session, product_data: Dict, category_id: int) -> bool:
    """Импортирует товар в базу данных"""
    try:
        # Проверяем, существует ли товар с таким артикулом
        if product_data.get('article'):
            existing = db.query(SQLProduct).filter(
                SQLProduct.article == product_data['article']
            ).first()
            if existing:
                print(f"  Товар с артикулом {product_data['article']} уже существует, пропускаем")
                return False
        
        # Создаем товар
        product = SQLProduct(
            category_id=category_id,
            name=product_data['name'],
            description=product_data['description'],
            article=product_data.get('article', ''),
            price_from=int(product_data.get('price') or 0),
            price_to=None,
            material="",
            sizes="[]",  # JSON string
            colors="[]",  # JSON string
            is_available=True
        )
        
        db.add(product)
        db.flush()
        
        # Добавляем характеристики
        for char in product_data.get('characteristics', []):
            characteristic = SQLProductCharacteristic(
                product_id=product.id,
                name=char['name'],
                value=char['value']
            )
            db.add(characteristic)
        
        db.commit()
        print(f"  ✓ Импортирован: {product_data['name']} (арт. {product_data.get('article', 'н/д')})")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"  ✗ Ошибка импорта товара {product_data['name']}: {e}")
        return False


def main():
    """Основная функция импорта"""
    print("=" * 80)
    print("ИМПОРТ ТОВАРОВ С AVIKTIME.RU")
    print("=" * 80)
    print()
    
    # Получаем сессию БД
    db = next(get_db())
    
    total_imported = 0
    total_skipped = 0
    total_errors = 0
    
    try:
        for category_name, category_url in CATEGORIES_TO_IMPORT.items():
            print(f"\n{'='*80}")
            print(f"Категория: {category_name}")
            print(f"URL: {category_url}")
            print(f"{'='*80}\n")
            
            # Получаем ID категории в нашей системе
            target_category_id = CATEGORY_MAPPING.get(category_name)
            if not target_category_id:
                print(f"⚠ Не найден маппинг категории, пропускаем")
                continue
            
            # Парсим список товаров
            print("Загрузка списка товаров...")
            products = parse_product_list(category_url)
            
            if not products:
                print("⚠ Товары не найдены")
                continue
            
            print(f"Найдено товаров: {len(products)}")
            print()
            
            # Обрабатываем каждый товар
            for idx, product_preview in enumerate(products, 1):
                print(f"[{idx}/{len(products)}] {product_preview['name']}")
                
                # Получаем детальную информацию
                product_detail = parse_product_detail(product_preview['url'])
                
                if not product_detail:
                    print(f"  ✗ Ошибка загрузки детальной информации")
                    total_errors += 1
                    continue
                
                # Используем артикул из preview, если он есть
                if not product_detail.get('article') and product_preview.get('article'):
                    product_detail['article'] = product_preview['article']
                
                # Импортируем в БД
                if import_product_to_db(db, product_detail, target_category_id):
                    total_imported += 1
                else:
                    total_skipped += 1
                
                # Пауза между запросами
                time.sleep(1)
            
            print(f"\n✓ Категория '{category_name}' обработана")
            
    finally:
        db.close()
    
    # Итоговая статистика
    print("\n" + "=" * 80)
    print("ИТОГИ ИМПОРТА")
    print("=" * 80)
    print(f"Импортировано товаров: {total_imported}")
    print(f"Пропущено (дубликаты): {total_skipped}")
    print(f"Ошибок: {total_errors}")
    print("=" * 80)


if __name__ == "__main__":
    main()
