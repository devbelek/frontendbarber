import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Region = {
  id: string;
  name: string;
  code: string;
};

// Регионы Кыргызстана
const KG_REGIONS: Region[] = [
  { id: '1', name: 'Бишкек', code: 'bishkek' },
  { id: '2', name: 'Ош', code: 'osh' },
  { id: '3', name: 'Баткенская область', code: 'batken' },
  { id: '4', name: 'Джалал-Абадская область', code: 'jalal-abad' },
  { id: '5', name: 'Иссык-Кульская область', code: 'issyk-kul' },
  { id: '6', name: 'Нарынская область', code: 'naryn' },
  { id: '7', name: 'Таласская область', code: 'talas' },
  { id: '8', name: 'Чуйская область', code: 'chuy' },
];

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationContextType = {
  currentRegion: Region;
  regions: Region[];
  setCurrentRegion: (region: Region) => void;
  loading: boolean;
  error: string | null;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Начальное значение - Бишкек по умолчанию
const DEFAULT_REGION = KG_REGIONS[0];

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [currentRegion, setCurrentRegion] = useState<Region>(() => {
    // Попытка восстановить регион из localStorage
    const savedRegion = localStorage.getItem('userRegion');
    if (savedRegion) {
      try {
        return JSON.parse(savedRegion);
      } catch (e) {
        return DEFAULT_REGION;
      }
    }
    return DEFAULT_REGION;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для определения региона по координатам
  const determineRegionFromCoords = async (coords: Coordinates): Promise<Region | null> => {
    try {
      // В реальном приложении здесь будет вызов API геокодирования
      // Например, Google Geocoding API или подобный сервис

      // Для MVP мы используем упрощенный подход:
      // Координаты Бишкека: примерно 42.87, 74.59
      // Координаты Оша: примерно 40.51, 72.80
      // и т.д.

      // Простая логика определения ближайшего города на основе координат
      // В реальном приложении будет использоваться более точный алгоритм

      if (coords.latitude > 42 && coords.longitude > 74) {
        return KG_REGIONS[0]; // Бишкек
      } else if (coords.latitude > 40 && coords.longitude > 72) {
        return KG_REGIONS[1]; // Ош
      } else if (coords.latitude > 39 && coords.longitude > 69) {
        return KG_REGIONS[2]; // Баткен
      }

      // В случае неопределенности возвращаем Бишкек
      return KG_REGIONS[0];
    } catch (error) {
      console.error('Error determining region from coordinates:', error);
      return null;
    }
  };

  // Эффект для определения местоположения при загрузке приложения
  useEffect(() => {
    const detectLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Проверка доступности геолокации в браузере
        if (!navigator.geolocation) {
          throw new Error('Геолокация не поддерживается вашим браузером');
        }

        // Получаем координаты пользователя
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            // Определяем регион на основе координат
            const detectedRegion = await determineRegionFromCoords(coords);

            if (detectedRegion) {
              setCurrentRegion(detectedRegion);
              // Сохраняем регион в localStorage
              localStorage.setItem('userRegion', JSON.stringify(detectedRegion));
            }

            setLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Не удалось определить ваше местоположение');
            setLoading(false);
          },
          { timeout: 10000, enableHighAccuracy: false }
        );
      } catch (err) {
        console.error('Location detection error:', err);
        setError(err instanceof Error ? err.message : 'Ошибка определения местоположения');
        setLoading(false);
      }
    };

    detectLocation();
  }, []);

  // Обновляем localStorage при изменении региона
  const handleSetCurrentRegion = (region: Region) => {
    setCurrentRegion(region);
    localStorage.setItem('userRegion', JSON.stringify(region));
  };

  return (
    <LocationContext.Provider
      value={{
        currentRegion,
        regions: KG_REGIONS,
        setCurrentRegion: handleSetCurrentRegion,
        loading,
        error
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};