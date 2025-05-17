import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FloatingActionButtonProps {
  to: string;
  icon?: React.ReactNode;
  label?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  to,
  icon = <Plus />,
  label = "Добавить"
}) => {
  return (
    <Link
      to={to}
      className="fixed bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center gap-2 bg-[#9A0F34] text-white py-3 px-5 rounded-full shadow-lg hover:bg-[#7b0c29] transition-colors"
      aria-label={label}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default FloatingActionButton;