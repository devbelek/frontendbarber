// src/ui/Button.tsx
import React from 'react';
import { cva } from 'class-variance-authority';

// Все варианты и стили кнопки в одном месте
const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-[#9A0F34] text-white hover:bg-[#7b0c29] shadow-sm",
        secondary: "bg-gray-900 text-white hover:bg-gray-800",
        outline: "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
        text: "bg-transparent text-gray-700 hover:underline p-0 shadow-none"
      },
      size: {
        sm: "text-xs h-8 px-3 py-1",
        md: "text-sm h-10 px-4 py-2",
        lg: "text-base h-12 px-6 py-3"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false
    }
  }
);

// Типы для кнопки
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Компонент кнопки
const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  fullWidth,
  isLoading,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={buttonStyles({ variant, size, fullWidth }) + ` ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Загрузка...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;