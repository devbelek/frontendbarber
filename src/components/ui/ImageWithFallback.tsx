// src/components/ui/ImageWithFallback.tsx - Исправленная версия
import { useState, forwardRef } from "react";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, alt, className = "", onLoad }, ref) => {
    const [error, setError] = useState(false);

    // Обрабатываем URL для корректного отображения медиа-файлов
    let imageUrl = src;

    // Проверяем, является ли URL относительным или абсолютным
    if (src && !src.startsWith("http") && !src.startsWith("data:")) {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // Убираем /api из URL если он есть
      const baseUrl = apiUrl.replace(/\/api\/?$/, "");

      // Добавляем слеш если его нет
      if (!src.startsWith("/")) {
        imageUrl = `${baseUrl}/${src}`;
      } else {
        imageUrl = `${baseUrl}${src}`;
      }
    }

    if (error || !src) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-200 ${className}`}
        >
          <ImageOff className="h-10 w-10 text-gray-400" />
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={imageUrl}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        onLoad={onLoad}
        crossOrigin="anonymous"
      />
    );
  }
);

ImageWithFallback.displayName = "ImageWithFallback";

export default ImageWithFallback;
