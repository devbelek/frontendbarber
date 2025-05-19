// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-100 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <h3 className="font-medium mb-3">TARAK</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-[#9A0F34]">О нас</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#9A0F34]">Контакты</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#9A0F34]">Условия использования</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Клиентам</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/gallery" className="text-gray-600 hover:text-[#9A0F34]">Галерея стрижек</Link></li>
              <li><Link to="/barbers" className="text-gray-600 hover:text-[#9A0F34]">Найти барбера</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-[#9A0F34]">Часто задаваемые вопросы</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Барберам</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-[#9A0F34]">Как это работает</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#9A0F34]">Правила публикации</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#9A0F34]">Стать барбером</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3">Контакты</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Бишкек, Кыргызстан</li>
              <li>info@tarak.kg</li>
              <li>+996 700 123 456</li>
            </ul>
            <div className="flex space-x-3 mt-3">
              <a href="#" className="text-gray-500 hover:text-[#9A0F34]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#9A0F34]">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#9A0F34]">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 TARAK. Все права защищены.</p>
          <div className="space-x-4 mt-3 md:mt-0">
            <a href="#" className="hover:text-[#9A0F34]">Условия использования</a>
            <a href="#" className="hover:text-[#9A0F34]">Политика конфиденциальности</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;