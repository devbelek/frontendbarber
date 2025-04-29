// src/types/index.ts

// Общие типы, используемые в приложении

export interface Haircut {
  id: string;
  image: string;
  title: string;
  price: number;
  barber: string;
  barberId: string;
  type: string;
  length: 'short' | 'medium' | 'long';
  style: string;
  location: string;
  duration?: number;
  isFavorite?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  specialization: string[];
  location: string;
  workingHours: {
    from: string;
    to: string;
    days: string[];
  };
  portfolio: string[];
  description: string;
  profile?: UserProfile;
  // New properties
  whatsapp?: string;
  telegram?: string;
  offerHomeService?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: UserProfile;
  favorites: string[];
  bookings?: Booking[];
}

export interface UserProfile {
  user_type: 'client' | 'barber';
  phone: string;
  photo?: string;
  whatsapp?: string;
  telegram?: string;
  address?: string;
  offers_home_service: boolean;
}

export interface Booking {
  id: string;
  client: string;
  service: string;
  service_details?: Haircut;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface Review {
  id: string;
  author: string;
  author_details?: User;
  barber: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  service: string;
  service_details?: Haircut;
  created_at: string;
}

export type Language = 'ru' | 'kg';