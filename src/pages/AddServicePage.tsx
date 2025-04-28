import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Clock, Tag, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

const AddServicePage: React.FC = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState<File[]>([]);
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ images, duration, price, title, description });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Добавить услугу</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Загрузить фото работы</span>
              <span className="text-xs text-gray-400 mt-1">
                Максимум 5 фотографий
              </span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 flex-shrink-0"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название услуги
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#9A0F34] focus:border-[#9A0F34]"
              placeholder="Например: Fade с укладкой"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#9A0F34] focus:border-[#9A0F34]"
              rows={3}
              placeholder="Опишите особенности стрижки..."
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Длительность
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#9A0F34] focus:border-[#9A0F34]"
              >
                <option value="30">30 минут</option>
                <option value="45">45 минут</option>
                <option value="60">1 час</option>
                <option value="90">1.5 часа</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена (сом)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#9A0F34] focus:border-[#9A0F34]"
                placeholder="500"
              />
            </div>
          </div>
        </motion.div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          className="mt-6"
        >
          Опубликовать
        </Button>
      </form>
    </div>
  );
};

export default AddServicePage;