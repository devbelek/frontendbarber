// src/components/ui/ImageCropper.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import Button from './Button';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1 // 1:1 для квадрата
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // При загрузке изображения центрируем его
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      setImageSize({ width, height });

      // Центрируем изображение при загрузке
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        setPosition({
          x: (containerWidth - width) / 2,
          y: (containerHeight - height) / 2
        });
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => Math.max(0.5, Math.min(3, prevScale * delta)));
  }, []);

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return;

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Размер выходного изображения
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Очищаем canvas
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Размер области обрезки в интерфейсе
    const cropAreaSize = 200;

    // Рассчитываем центр области обрезки относительно контейнера
    const containerRect = containerRef.current.getBoundingClientRect();
    const cropAreaCenterX = containerRect.width / 2;
    const cropAreaCenterY = containerRect.height / 2;

    // Рассчитываем позицию на исходном изображении с учетом масштаба и смещения
    const sourceX = (cropAreaCenterX - position.x) / scale;
    const sourceY = (cropAreaCenterY - position.y) / scale;
    const sourceSize = cropAreaSize / scale;

    // Рисуем обрезанное изображение
    ctx.drawImage(
      image,
      sourceX - sourceSize / 2,
      sourceY - sourceSize / 2,
      sourceSize,
      sourceSize,
      0,
      0,
      outputSize,
      outputSize
    );

    // Конвертируем в blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        onCropComplete(file);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Обрезать изображение</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div
            ref={containerRef}
            className="relative w-full h-64 bg-gray-100 overflow-hidden cursor-move flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Изображение */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Обрезка изображения"
              className="absolute"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                maxWidth: 'none',
                transformOrigin: 'center',
              }}
              draggable={false}
            />

            {/* Маска обрезки */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-full"
                style={{
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                }}
              ></div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Инструкции */}
          <p className="text-sm text-gray-600 mt-4">
            Перетаскивайте изображение и используйте колесо мыши для масштабирования
          </p>

          {/* Контроль масштаба */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Масштаб
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Отмена
          </Button>
          <Button variant="primary" onClick={handleCrop} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;