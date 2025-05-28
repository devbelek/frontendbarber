// src/types/index.ts - добавьте новые типы
export interface Barbershop {
  id: string;
  name: string;
  logo?: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  workingHours: {
    from: string;
    to: string;
    days: string[];
  };
  barbers: string[]; // ID барберов
  services: string[]; // ID услуг
  photos: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  owner: string; // ID владельца
  createdAt: string;
  updatedAt: string;
}

export interface BarberProfile extends UserProfile {
  barbershopId?: string; // Связь с барбершопом
  barbershop?: Barbershop;
  isIndependent: boolean; // Работает самостоятельно или в барбершопе
}

export interface Haircut {
  id: string;
  images: ServiceImage[];
  primaryImage: string;
  title: string;
  price: number;
  description: string;
  barber: string;
  barberId: string;
  type: string;
  length: 'short' | 'medium' | 'long';
  style: string;
  location: string;
  duration?: number;
  isFavorite?: boolean;
  description?: string;
  views: number;
}

export interface ServiceImage {
  id: string;
  image: string;
  isPrimary: boolean;
  order: number;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  rating?: number;
  reviewCount?: number;
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
  googleId?: string;
  isGoogleUser?: boolean;
  picture?: string;
}

export interface UserProfile {
  user_type: 'client' | 'barber';
  phone: string;
  photo?: string;
  whatsapp?: string;
  telegram?: string;
  address?: string;
  offers_home_service: boolean;
  latitude?: number | null;
  longitude?: number | null;
  location_updated_at?: string;
  bio?: string;
  working_hours_from?: string;
  working_hours_to?: string;
  working_days?: string[];
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

// Типы для API ответов
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Типы для запросов
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  re_password: string;
  first_name?: string;
  last_name?: string;
}

export interface BookingRequest {
  service: string;
  date: string;
  time: string;
  notes?: string;
  client_name?: string;
  client_phone?: string;
}

export interface ReviewRequest {
  barber: string;
  rating: number;
  comment: string;
}

export interface ServiceRequest {
  title: string;
  price: number;
  duration: number;
  type: string;
  length: string;
  style: string;
  location: string;
  description?: string;
}

// Типы для ответов
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    user_type: 'client' | 'barber';
    phone?: string;
    photo?: string;
    whatsapp?: string;
    telegram?: string;
    address?: string;
    offers_home_service: boolean;
    latitude?: number;
    longitude?: number;
    bio?: string;
    working_hours_from?: string;
    working_hours_to?: string;
    working_days?: string[];
  };
}

export interface ServiceResponse {
  id: number;
  title: string;
  price: string;
  duration: number;
  type: string;
  length: string;
  style: string;
  location: string;
  description?: string;
  views: number;
  created_at: string;
  updated_at: string;
  barber: number;
  barber_details: {
    id: number;
    username: string;
    full_name: string;
    whatsapp?: string;
    telegram?: string;
  };
  images: Array<{
    id: number;
    image: string;
    is_primary: boolean;
    order: number;
  }>;
  primary_image?: string;
  is_favorite: boolean;
}

export interface BookingResponse {
  id: number;
  client: number;
  service: number;
  service_details?: ServiceResponse;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  client_name_contact?: string;
  client_phone_contact?: string;
}

export interface ReviewResponse {
  id: number;
  author: number;
  author_details?: UserResponse;
  barber: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface BarberStatsResponse {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  avgRating: number;
  by_service: Array<{
    service__title: string;
    count: number;
  }>;
}