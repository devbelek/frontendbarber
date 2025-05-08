import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean; // Явно указываем этот параметр
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled = false, // Добавляем значение по умолчанию
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50';

  const variantClasses = {
    primary: 'bg-[#9A0F34] text-white hover:bg-[#7b0c29] focus:ring-[#9A0F34]',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-800',
    outline: 'border-2 border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 focus:ring-gray-300',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-300'
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;