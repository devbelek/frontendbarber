import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const RegionSelector: React.FC = () => {
  const { currentRegion, regions, setCurrentRegion } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectRegion = (region: typeof currentRegion) => {
    setCurrentRegion(region);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-600 hover:text-[#9A0F34] transition-colors py-1 px-2 rounded-md hover:bg-gray-100"
      >
        <MapPin className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium mr-1">{currentRegion.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg py-1 z-50 min-w-[180px]">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleSelectRegion(region)}
              className={`w-full text-left px-4 py-2 text-sm ${
                currentRegion.id === region.id
                  ? 'bg-gray-100 text-[#9A0F34]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegionSelector;