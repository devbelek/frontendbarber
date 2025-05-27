import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

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
  aspectRatio = 1
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      setImageSize({ width, height });

      if (containerRef.current) {
        const containerSize = 300; // размер области обрезки

        // Вычисляем минимальный масштаб, чтобы изображение покрывало всю область обрезки
        const minScale = Math.max(
          containerSize / width,
          containerSize / height
        ) * 1.2; // добавляем 20% запаса

        setScale(minScale);

        // Центрируем изображение
        setPosition({
          x: 0,
          y: 0
        });
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Ограничиваем перемещение, чтобы изображение не выходило за пределы области обрезки
    const containerSize = 300;
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;

    const maxX = Math.min(0, (containerSize - scaledWidth) / 2);
    const minX = Math.max((containerSize - scaledWidth) / 2, 0);
    const maxY = Math.min(0, (containerSize - scaledHeight) / 2);
    const minY = Math.max((containerSize - scaledHeight) / 2, 0);

    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    });
  }, [isDragging, dragStart, imageSize, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(5, scale * delta));

    // Масштабируем относительно центра
    const containerSize = 300;
    const scaleDiff = newScale - scale;
    const newX = position.x - (imageSize.width * scaleDiff) / 2;
    const newY = position.y - (imageSize.height * scaleDiff) / 2;

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  }, [scale, position, imageSize]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return;

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outputSize = 400; // увеличиваем выходной размер для лучшего качества
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.clearRect(0, 0, outputSize, outputSize);

    // Сохраняем текущее состояние контекста
    ctx.save();

    // Переносим центр координат в центр canvas
    ctx.translate(outputSize / 2, outputSize / 2);

    // Применяем поворот
    ctx.rotate((rotation * Math.PI) / 180);

    // Размер области обрезки в UI
    const cropAreaSize = 300;

    // Вычисляем, какую часть исходного изображения нужно взять
    const sourceSize = cropAreaSize / scale;
    const sourceX = (imageSize.width - sourceSize) / 2 - position.x / scale;
    const sourceY = (imageSize.height - sourceSize) / 2 - position.y / scale;

    // Рисуем изображение
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      -outputSize / 2,
      -outputSize / 2,
      outputSize,
      outputSize
    );

    // Восстанавливаем состояние контекста
    ctx.restore();

    // Конвертируем в blob с высоким качеством
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        onCropComplete(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-8">
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
            className="relative w-[300px] h-[300px] mx-auto bg-gray-100 overflow-hidden cursor-move rounded-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Обрезка изображения"
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                maxWidth: 'none',
              }}
              draggable={false}
            />

            {/* Маска обрезки */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-white rounded-full"
                style={{
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                }}
              ></div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Инструкции */}
          <p className="text-sm text-gray-600 mt-4 text-center">
            Перетаскивайте изображение и используйте колесо мыши для масштабирования
          </p>

          {/* Контролы */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={() => setScale(prev => Math.min(5, prev + 0.1))}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 px-4 py-2 bg-[#9A0F34] text-white rounded-lg hover:bg-[#7b0c29] transition-colors flex items-center justify-center"
          >
            <Check className="h-4 w-4 mr-2" />
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;