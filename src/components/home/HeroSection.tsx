// src/components/home/HeroSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { Button } from '../../ui';
import { useLanguage } from '../../context/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Фоновое видео */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://cdn.pixabay.com/video/2022/10/10/134866-759217154_large.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Содержимое героя */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-soft">
              <Scissors className="w-10 h-10 text-brand-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('heroTitle')}
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/gallery">
              <Button size="lg" variant="primary" className="shadow-xl px-8">
                {t('exploreGallery')}
              </Button>
            </Link>

            <Link to="/barbers">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                {t('barbers')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Стрелка вниз */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;