import React, { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';
import { filterOptions } from '../../data/mockData';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  onSearch: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, onSearch }) => {
  const { t } = useLanguage();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    types: [] as string[],
    lengths: [] as string[],
    styles: [] as string[],
    locations: [] as string[],
  });

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const updatedFilters = { ...prev };
      
      if (updatedFilters[category].includes(value)) {
        updatedFilters[category] = updatedFilters[category].filter(item => item !== value);
      } else {
        updatedFilters[category] = [...updatedFilters[category], value];
      }
      
      return updatedFilters;
    });
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const applyFilters = () => {
    onFilterChange(selectedFilters);
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters({
      types: [],
      lengths: [],
      styles: [],
      locations: [],
    });
    setSearchQuery('');
    onSearch('');
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0) || searchQuery;

  return (
    <div className="bg-white shadow-sm rounded-lg mb-6">
      {/* Search Bar */}
      <div className="p-4 flex items-center">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#9A0F34] focus:border-[#9A0F34] sm:text-sm"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          className="ml-3"
        >
          {t('search')}
        </Button>
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="ml-3 p-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
        >
          <Filter className="h-5 w-5 text-gray-500" />
          <ChevronDown className={`h-4 w-4 text-gray-400 ml-1 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Type Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filterByType')}</h3>
              <div className="space-y-2">
                {filterOptions.types.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                      checked={selectedFilters.types.includes(type)}
                      onChange={() => toggleFilter('types', type)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Length Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filterByLength')}</h3>
              <div className="space-y-2">
                {filterOptions.lengths.map((length) => (
                  <label key={length} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                      checked={selectedFilters.lengths.includes(length)}
                      onChange={() => toggleFilter('lengths', length)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{length}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Style Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filterByStyle')}</h3>
              <div className="space-y-2">
                {filterOptions.styles.map((style) => (
                  <label key={style} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                      checked={selectedFilters.styles.includes(style)}
                      onChange={() => toggleFilter('styles', style)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{style}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t('filterByLocation')}</h3>
              <div className="space-y-2">
                {filterOptions.locations.map((location) => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#9A0F34] focus:ring-[#9A0F34] border-gray-300 rounded"
                      checked={selectedFilters.locations.includes(location)}
                      onChange={() => toggleFilter('locations', location)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                {t('clearFilters')}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={applyFilters}
              className="ml-auto"
            >
              {t('search')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;