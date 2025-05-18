// src/components/ui/FloatingActionButton.tsx
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
  icon = <Plus className="h-6 w-6" />,
  label = "Добавить"
}) => {
  return (
    <Link
      to={to}
      className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg"
      aria-label={label}
    >
      {icon}
    </Link>
  );
};

export default FloatingActionButton;