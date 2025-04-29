import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Home, Search } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Scissors className="w-64 h-64 text-[#9A0F34]" />
          </div>
          <div className="relative">
            <h1 className="text-9xl font-extrabold text-[#9A0F34]">404</h1>
            <div className="absolute -bottom-3 w-full">
              <div className="h-1.5 bg-[#9A0F34] rounded-full mx-auto w-24"></div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Страница не найдена
        </h2>

        <p className="text-gray-600 mb-8">
          Похоже, вы нашли что-то, что мы еще не успели подстричь и уложить.
          Давайте вернемся на домашнюю страницу и начнем сначала.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" className="flex items-center justify-center">
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </Link>

          <Link to="/gallery">
            <Button variant="outline" className="flex items-center justify-center">
              <Search className="mr-2 h-4 w-4" />
              Искать стрижки
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;