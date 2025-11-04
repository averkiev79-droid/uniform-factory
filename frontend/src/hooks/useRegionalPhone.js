import { useState, useEffect } from 'react';
import apiService from '../services/api';

/**
 * Hook для определения региона пользователя и получения соответствующего телефона
 * 
 * Телефоны по регионам:
 * - Санкт-Петербург и ЛО: +7 (812) 317-73-19
 * - Москва и МО: +7 (499) 653-65-07
 * - Другие регионы: +7 (800) 555-37-95
 * - По умолчанию (если не определилось): +7 (812) 317-73-19
 * 
 * Кэширует результат в localStorage на 24 часа
 */
export const useRegionalPhone = () => {
  const [phone, setPhone] = useState('+7 (812) 317-73-19'); // Fallback по умолчанию
  const [loading, setLoading] = useState(true);
  const [regionInfo, setRegionInfo] = useState(null);

  useEffect(() => {
    const getRegionalPhone = async () => {
      try {
        // Проверяем кэш
        const cached = localStorage.getItem('regional_phone');
        const cacheTime = localStorage.getItem('regional_phone_time');
        
        if (cached && cacheTime) {
          const now = new Date().getTime();
          const cacheAge = now - parseInt(cacheTime);
          const oneDayInMs = 24 * 60 * 60 * 1000; // 24 часа
          
          // Если кэш свежий (меньше 24 часов)
          if (cacheAge < oneDayInMs) {
            const cachedData = JSON.parse(cached);
            setPhone(cachedData.phone);
            setRegionInfo(cachedData);
            setLoading(false);
            return;
          }
        }

        // Если кэш устарел или его нет - запрашиваем с сервера
        const response = await apiService.getRegion();
        
        if (response && response.phone) {
          setPhone(response.phone);
          setRegionInfo(response);
          
          // Сохраняем в кэш
          localStorage.setItem('regional_phone', JSON.stringify(response));
          localStorage.setItem('regional_phone_time', new Date().getTime().toString());
        }
      } catch (error) {
        console.error('Error getting regional phone:', error);
        // В случае ошибки используем fallback
        setPhone('+7 (812) 317-73-19');
      } finally {
        setLoading(false);
      }
    };

    getRegionalPhone();
  }, []);

  return { phone, loading, regionInfo };
};

export default useRegionalPhone;
