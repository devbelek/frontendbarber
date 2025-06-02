import { createContext, useState, useContext, ReactNode } from "react";

type Region = {
  id: string;
  name: string;
  code: string;
};

// Регионы Кыргызстана
const KG_REGIONS: Region[] = [
  { id: "1", name: "Бишкек", code: "bishkek" },
  { id: "2", name: "Ош", code: "osh" },
  { id: "3", name: "Баткенская область", code: "batken" },
  { id: "4", name: "Джалал-Абадская область", code: "jalal-abad" },
  { id: "5", name: "Иссык-Кульская область", code: "issyk-kul" },
  { id: "6", name: "Нарынская область", code: "naryn" },
  { id: "7", name: "Таласская область", code: "talas" },
  { id: "8", name: "Чуйская область", code: "chuy" },
];

type LocationContextType = {
  currentRegion: Region;
  regions: Region[];
  setCurrentRegion: (region: Region) => void;
  loading: boolean;
  error: string | null;
};

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

// Начальное значение - Бишкек по умолчанию
const DEFAULT_REGION = KG_REGIONS[0];

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [currentRegion, setCurrentRegion] = useState<Region>(() => {
    // Попытка восстановить регион из localStorage
    const savedRegion = localStorage.getItem("userRegion");
    if (savedRegion) {
      try {
        return JSON.parse(savedRegion);
      } catch (e) {
        return DEFAULT_REGION;
      }
    }
    return DEFAULT_REGION;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Обновляем localStorage при изменении региона
  const handleSetCurrentRegion = (region: Region) => {
    setCurrentRegion(region);
    localStorage.setItem("userRegion", JSON.stringify(region));
  };

  return (
    <LocationContext.Provider
      value={{
        currentRegion,
        regions: KG_REGIONS,
        setCurrentRegion: handleSetCurrentRegion,
        loading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
