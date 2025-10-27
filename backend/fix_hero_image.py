#!/usr/bin/env python3
"""
Скрипт для исправления путей к изображениям в настройках
Проблема: иногда в базе сохраняются URL со старых доменов
Решение: заменить на правильные пути
"""

import sqlite3
from datetime import datetime

def fix_hero_image():
    """Исправить hero_image в настройках"""
    conn = sqlite3.connect('avik_uniform.db')
    cursor = conn.cursor()
    
    print(f"\n{'='*60}")
    print(f"Исправление hero_image")
    print(f"Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    # Проверяем текущее значение
    cursor.execute("SELECT hero_image FROM app_settings WHERE id='default'")
    result = cursor.fetchone()
    
    if not result:
        print("❌ Настройки не найдены")
        conn.close()
        return
    
    current_value = result[0]
    print(f"Текущее значение: {current_value}")
    
    # Проверяем, нужно ли исправлять
    needs_fix = False
    
    if current_value and ('emergent' in current_value.lower() or 
                          'preview' in current_value.lower() or
                          current_value.startswith('http')):
        needs_fix = True
        print("⚠️  Обнаружен старый URL!")
    
    if not current_value or current_value == '':
        needs_fix = True
        print("⚠️  Пустое значение!")
    
    if needs_fix:
        # Исправляем на дефолтный путь
        new_value = '/images/hero-main.jpg'
        cursor.execute("""
            UPDATE app_settings 
            SET hero_image = ? 
            WHERE id = 'default'
        """, (new_value,))
        
        conn.commit()
        print(f"✅ Исправлено на: {new_value}")
    else:
        print(f"✅ Путь корректный, исправление не требуется")
    
    conn.close()
    print(f"\n{'='*60}\n")

if __name__ == "__main__":
    fix_hero_image()
