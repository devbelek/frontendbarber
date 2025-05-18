import React from 'react';
import HaircutCardNew from './HaircutCardNew';
import { Haircut } from '../../types';

interface HaircutGridProps {
  haircuts: Haircut[];
  onBookClick: (haircut: Haircut) => void;
}

const HaircutGridNew: React.FC<HaircutGridProps> = ({ haircuts, onBookClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
      {haircuts.map((haircut) => (
        <HaircutCardNew
          key={haircut.id}
          haircut={haircut}
          onBookClick={onBookClick}
        />
      ))}
    </div>
  );
};

export default HaircutGridNew;