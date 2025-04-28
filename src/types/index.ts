// Common types used across the application

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
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  favorites: string[];
  bookings: Booking[];
}

export interface Booking {
  id: string;
  userId: string;
  barberId: string;
  haircutId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export type Language = 'ru' | 'kg';