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
    const imageUrl = src && !src.startsWith('http') && !src.startsWith('data:')
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${src.startsWith('/') ? '' : '/'}${src}`
      : src;

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