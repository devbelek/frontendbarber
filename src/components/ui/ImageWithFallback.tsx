// src/components/ui/ImageWithFallback.tsx
import React, { useState, forwardRef } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, alt, className = '', onLoad }, ref) => {
    const [error, setError] = useState(false);

    // Обрабатываем URL для корректного отображения медиа-файлов
    let imageUrl = src;

    // Проверяем, является ли URL относительным или абсолютным
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      // Относительные URL нужно префиксить с base URL или API URL
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      // Удаляем лишний слеш, если он есть и в API URL, и в src
      const hasApiSlash = apiUrl.endsWith('/');
      const hasSrcSlash = src.startsWith('/');

      if (hasApiSlash && hasSrcSlash) {
        imageUrl = `${apiUrl}${src.substring(1)}`;
      } else if (!hasApiSlash && !hasSrcSlash) {
        imageUrl = `${apiUrl}/${src}`;
      } else {
        imageUrl = `${apiUrl}${src}`;
      }
    }

    if (error || !src) {
      return (
        <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
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
      />
    );
  }
);

ImageWithFallback.displayName = 'ImageWithFallback';

export default ImageWithFallback;