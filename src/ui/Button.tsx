import React from 'react';
import { cva } from 'class-variance-authority'; // Добавьте эту библиотеку через npm

// Определяем все возможные варианты кнопки в одном месте
const buttonStyles = cva(
  // Базовые стили для всех кнопок
  "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none",
  {
    // Варианты кнопки (primary, outline и т.д.)
    variants: {
      variant: {
        primary: "bg-[#9A0F34] text-white hover:bg-[#7b0c29] shadow-lg shadow-[#9A0F34]/20",
        secondary: "bg-gray-900 text-white hover:bg-gray-800",
        outline: "border-2 border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-900 hover:bg-gray-100"
      },
      // Размеры кнопки
      size: {
        sm: "text-sm h-8 px-3 py-1.5 rounded-md",
        md: "text-sm h-10 px-4 py-2 rounded-md",
        lg: "text-base h-12 px-6 py-3 rounded-md"
      },
      // Возможность растягивать кнопку на всю ширину
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    // Значения по умолчанию
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false
    }
  }
);

// Типы для TypeScript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

// Сам компонент кнопки
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
      className={buttonStyles({ variant, size, fullWidth, className })}
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