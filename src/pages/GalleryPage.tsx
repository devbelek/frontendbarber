import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HaircutGrid from '../components/haircuts/HaircutGrid';
import FilterBar from '../components/filters/FilterBar';
import BookingModal from '../components/booking/BookingModal';
import { haircuts } from '../data/mockData';
import { Haircut } from '../types';
import { useLanguage } from '../context/LanguageContext';

const GalleryPage: React.FC = () => {
  const { t } = useLanguage();
  const [filteredHaircuts, setFilteredHaircuts] = useState<Haircut[]>(haircuts);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedHaircut, setSelectedHaircut] = useState<Haircut | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (filters: any) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let result = [...haircuts];
      
      // Apply type filters
      if (filters.types && filters.types.length > 0) {
        result = result.filter(haircut => filters.types.includes(haircut.type));
      }
      
      // Apply length filters
      if (filters.lengths && filters.lengths.length > 0) {
        result = result.filter(haircut => filters.lengths.includes(haircut.length));
      }
      
      // Apply style filters
      if (filters.styles && filters.styles.length > 0) {
        result = result.filter(haircut => filters.styles.includes(haircut.style));
      }
      
      // Apply location filters
      if (filters.locations && filters.locations.length > 0) {
        result = result.filter(haircut => filters.locations.includes(haircut.location));
      }
      
      setFilteredHaircuts(result);
      setIsLoading(false);
    }, 500);
  };

  const handleSearch = (query: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!query.trim()) {
        setFilteredHaircuts(haircuts);
        setIsLoading(false);
        return;
      }
      
      const lowerCaseQuery = query.toLowerCase();
      const result = haircuts.filter(
        haircut => 
          haircut.title.toLowerCase().includes(lowerCaseQuery) || 
          haircut.barber.toLowerCase().includes(lowerCaseQuery) ||
          haircut.type.toLowerCase().includes(lowerCaseQuery)
      );
      
      setFilteredHaircuts(result);
      setIsLoading(false);
    }, 500);
  };

  const handleBookClick = (haircut: Haircut) => {
    setSelectedHaircut(haircut);
    setIsBookingModalOpen(true);
  };
  
  const handleBookingConfirm = (date: string, time: string) => {
    // In a real app, this would send the booking to an API
    console.log('Booking confirmed:', { haircut: selectedHaircut, date, time });
    setIsBookingModalOpen(false);
    // You might show a success message or redirect the user
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('gallery')}</h1>
        
        <FilterBar 
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34]"></div>
          </div>
        ) : filteredHaircuts.length > 0 ? (
          <HaircutGrid 
            haircuts={filteredHaircuts} 
            onBookClick={handleBookClick} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg 
              className="h-16 w-16 text-gray-400 mb-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noResults')}</h3>
            <p className="text-gray-500">
              Попробуйте изменить параметры поиска или сбросить фильтры.
            </p>
          </div>
        )}
        
        {/* Pagination (simplified for MVP) */}
        {filteredHaircuts.length > 0 && (
          <div className="mt-12 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <a 
                href="#" 
                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Previous
              </a>
              <a 
                href="#" 
                className="px-3 py-2 border-t border-b border-gray-300 bg-white text-[#9A0F34] font-medium"
              >
                1
              </a>
              <a 
                href="#" 
                className="px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                2
              </a>
              <a 
                href="#" 
                className="px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-r-md"
              >
                Next
              </a>
            </nav>
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        haircut={selectedHaircut}
        onConfirm={handleBookingConfirm}
      />
    </Layout>
  );
};

export default GalleryPage;