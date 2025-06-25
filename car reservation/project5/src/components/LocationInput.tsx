import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Location } from '../types/booking';
import { searchLocations, getCurrentLocation } from '../utils/geolocation';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
  showCurrentLocation?: boolean;
  icon?: React.ReactNode;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onLocationSelect,
  showCurrentLocation = false,
  icon
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (value.length >= 3) {
        setIsLoading(true);
        try {
          const results = await searchLocations(value);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search error:', error);
        }
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [value]);

  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      onLocationSelect(location);
      onChange(location.address);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Geolocation error:', error);
      alert('Unable to get your current location. Please ensure location access is enabled.');
    }
    setIsGettingLocation(false);
  };

  const handleSuggestionClick = (location: Location) => {
    onLocationSelect(location);
    onChange(location.address);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon || <MapPin className="h-5 w-5 text-gray-400" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
        />
        {value && (
          <button
            onClick={clearInput}
            className="absolute inset-y-0 right-8 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {showCurrentLocation && (
          <button
            onClick={handleCurrentLocation}
            disabled={isGettingLocation}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="Use current location"
          >
            <Navigation className={`h-5 w-5 ${isGettingLocation ? 'animate-pulse' : ''}`} />
          </button>
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Searching...
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.placeId}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-900 leading-tight">
                    {suggestion.address}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};