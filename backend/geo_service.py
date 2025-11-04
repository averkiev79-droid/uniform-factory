"""
Сервис для определения региона пользователя по IP адресу
"""
import requests
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Маппинг регионов на телефоны
REGIONAL_PHONES = {
    "Saint Petersburg": "+7 (812) 317-73-19",
    "Moscow": "+7 (499) 653-65-07",
    "default": "+7 (800) 555-37-95",
    "fallback": "+7 (812) 317-73-19"  # По умолчанию если не определилось
}

# Список регионов Санкт-Петербурга и Ленинградской области
SPB_REGIONS = [
    "Saint Petersburg",
    "Sankt-Peterburg",
    "Leningrad Oblast",
    "Leningradskaya Oblast"
]

# Список регионов Москвы и Московской области
MSK_REGIONS = [
    "Moscow",
    "Moskva",
    "Moscow Oblast",
    "Moskovskaya Oblast"
]


def get_region_by_ip(ip_address: str) -> Dict[str, str]:
    """
    Определяет регион пользователя по IP адресу
    
    Args:
        ip_address: IP адрес пользователя
        
    Returns:
        Dict с информацией о регионе и телефоне
    """
    try:
        # Проверка на локальные IP
        if ip_address in ["127.0.0.1", "localhost", "::1"] or ip_address.startswith("192.168.") or ip_address.startswith("10."):
            logger.info(f"Local IP detected: {ip_address}, using fallback")
            return {
                "ip": ip_address,
                "city": "Unknown",
                "region": "Unknown",
                "country": "RU",
                "phone": REGIONAL_PHONES["fallback"],
                "source": "local"
            }
        
        # Используем бесплатный API ipapi.co (1000 запросов/день)
        response = requests.get(
            f"https://ipapi.co/{ip_address}/json/",
            timeout=3
        )
        
        if response.status_code == 200:
            data = response.json()
            
            city = data.get("city", "Unknown")
            region = data.get("region", "Unknown")
            country = data.get("country_code", "Unknown")
            
            # Определяем телефон по региону
            phone = determine_phone_by_region(city, region)
            
            logger.info(f"IP {ip_address}: {city}, {region}, {country} -> {phone}")
            
            return {
                "ip": ip_address,
                "city": city,
                "region": region,
                "country": country,
                "phone": phone,
                "source": "ipapi"
            }
        else:
            logger.warning(f"ipapi.co returned status {response.status_code} for IP {ip_address}")
            return get_fallback_response(ip_address)
            
    except requests.Timeout:
        logger.error(f"Timeout getting region for IP {ip_address}")
        return get_fallback_response(ip_address)
    except Exception as e:
        logger.error(f"Error getting region for IP {ip_address}: {str(e)}")
        return get_fallback_response(ip_address)


def determine_phone_by_region(city: str, region: str) -> str:
    """
    Определяет телефон по городу и региону
    
    Args:
        city: Название города
        region: Название региона
        
    Returns:
        Номер телефона
    """
    # Проверка на Санкт-Петербург и ЛО
    if any(spb in city for spb in SPB_REGIONS) or any(spb in region for spb in SPB_REGIONS):
        return REGIONAL_PHONES["Saint Petersburg"]
    
    # Проверка на Москву и МО
    if any(msk in city for msk in MSK_REGIONS) or any(msk in region for msk in MSK_REGIONS):
        return REGIONAL_PHONES["Moscow"]
    
    # Все остальные регионы - бесплатный номер
    return REGIONAL_PHONES["default"]


def get_fallback_response(ip_address: str) -> Dict[str, str]:
    """
    Возвращает fallback ответ если не удалось определить регион
    
    Args:
        ip_address: IP адрес пользователя
        
    Returns:
        Dict с fallback данными
    """
    return {
        "ip": ip_address,
        "city": "Unknown",
        "region": "Unknown",
        "country": "RU",
        "phone": REGIONAL_PHONES["fallback"],
        "source": "fallback"
    }
