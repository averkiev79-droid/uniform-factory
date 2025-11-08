"""
Скрипт для установки hero_image на production
Запустить один раз после деплоя
"""
import sqlite3
import sys

def set_hero_image(image_url):
    """
    Устанавливает hero_image в production БД
    
    Args:
        image_url: URL изображения, например /api/uploads/abc123.jpg
    """
    try:
        conn = sqlite3.connect('avik_uniform.db')
        cursor = conn.cursor()
        
        # Проверим существование записи
        cursor.execute("SELECT id, hero_image FROM app_settings WHERE id='default'")
        result = cursor.fetchone()
        
        if result:
            old_image = result[1]
            print(f"Текущее изображение: {old_image}")
            
            # Обновляем
            cursor.execute("""
                UPDATE app_settings 
                SET hero_image = ? 
                WHERE id = 'default'
            """, (image_url,))
            conn.commit()
            
            print(f"✅ Hero изображение обновлено на: {image_url}")
        else:
            # Создаём запись, если её нет
            cursor.execute("""
                INSERT INTO app_settings (id, hero_image) 
                VALUES ('default', ?)
            """, (image_url,))
            conn.commit()
            
            print(f"✅ Создана запись с hero_image: {image_url}")
        
        conn.close()
        print("✅ Изменения сохранены")
        
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python3 set_hero_image_production.py <URL_изображения>")
        print("Пример: python3 set_hero_image_production.py /api/uploads/abc123.jpg")
        sys.exit(1)
    
    image_url = sys.argv[1]
    set_hero_image(image_url)
