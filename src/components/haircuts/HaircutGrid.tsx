// src/components/haircuts/HaircutGrid.tsx - оптимизированная версия
import React from 'react';
import HaircutCard from './HaircutCard';
import { Haircut } from '../../types';

interface HaircutGridProps {
  haircuts: Haircut[];
  onBookClick: (haircut: Haircut) => void;
}

const HaircutGrid: React.FC<HaircutGridProps> = ({ haircuts, onBookClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
      {haircuts.map((haircut) => (
        <HaircutCard
          key={haircut.id}
          haircut={haircut}
          onBookClick={onBookClick}
        />
      ))}
    </div>
  );
};

export default HaircutGrid;