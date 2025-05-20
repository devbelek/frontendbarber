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
    className="hidden"
    aria-label={label}
  >
    {icon}
  </Link>
);
};

export default FloatingActionButton;