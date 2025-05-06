import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className = '', onLoad }) => {
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
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      onLoad={onLoad}
    />
  );
};

export default ImageWithFallback;