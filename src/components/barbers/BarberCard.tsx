import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Barber } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BarberCardProps {
  barber: Barber;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber }) => {
  const { t } = useLanguage();

  return (
    <Card className="h-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={barber.avatar}
          alt={barber.name}
          className="w-full h-48 object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{barber.name}</h3>
        
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-sm font-medium">{barber.rating}</span>
          <span className="text-sm text-gray-500 ml-1">({barber.reviewCount})</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          <span>{barber.location.split(',')[0]}</span>
        </div>
        
        <div className="mb-4">
          <h4 className="text-xs uppercase text-gray-500 mb-1">{t('specialization')}</h4>
          <div className="flex flex-wrap gap-1">
            {barber.specialization.map((spec, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-100 rounded-full text-xs"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
        
        <Link to={`/barber/${barber.id}`}>
          <Button variant="outline" fullWidth>
            {t('viewAll')}
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default BarberCard;