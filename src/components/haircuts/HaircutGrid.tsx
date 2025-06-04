import React from "react";
import HaircutCard from "./HaircutCard";
import { Haircut } from "../../types";

interface HaircutGridProps {
  haircuts: Haircut[];
  onBookClick: (haircut: Haircut) => void;
}

const HaircutGrid: React.FC<HaircutGridProps> = ({ haircuts, onBookClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
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
