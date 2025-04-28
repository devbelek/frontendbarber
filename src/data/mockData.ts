import { Haircut, Barber } from '../types';

export const haircuts: Haircut[] = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1576937/pexels-photo-1576937.jpeg',
    title: 'Классическая стрижка',
    price: 500,
    barber: 'Александр П.',
    barberId: '1',
    type: 'classic',
    length: 'short',
    style: 'business',
    location: 'Бишкек, Центр'
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg',
    title: 'Фейд с текстурой',
    price: 600,
    barber: 'Максим К.',
    barberId: '2',
    type: 'fade',
    length: 'short',
    style: 'modern',
    location: 'Бишкек, Восток'
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
    title: 'Андеркат',
    price: 650,
    barber: 'Руслан Д.',
    barberId: '3',
    type: 'undercut',
    length: 'medium',
    style: 'trendy',
    location: 'Бишкек, Центр'
  },
  {
    id: '4',
    image: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
    title: 'Кроп с выбритыми висками',
    price: 550,
    barber: 'Александр П.',
    barberId: '1',
    type: 'crop',
    length: 'short',
    style: 'casual',
    location: 'Бишкек, Центр'
  },
  {
    id: '5',
    image: 'https://images.pexels.com/photos/2531734/pexels-photo-2531734.jpeg',
    title: 'Помпадур',
    price: 700,
    barber: 'Максим К.',
    barberId: '2',
    type: 'pompadour',
    length: 'medium',
    style: 'vintage',
    location: 'Бишкек, Восток'
  },
  {
    id: '6',
    image: 'https://images.pexels.com/photos/1541695/pexels-photo-1541695.jpeg',
    title: 'Текстурный топ',
    price: 600,
    barber: 'Руслан Д.',
    barberId: '3',
    type: 'textured',
    length: 'medium',
    style: 'trendy',
    location: 'Бишкек, Центр'
  }
];

export const barbers: Barber[] = [
  {
    id: '1',
    name: 'Александр Петров',
    avatar: 'https://images.pexels.com/photos/1081188/pexels-photo-1081188.jpeg',
    rating: 4.8,
    reviewCount: 124,
    specialization: ['classic', 'crop', 'fade'],
    location: 'Бишкек, ул. Киевская 95',
    workingHours: {
      from: '10:00',
      to: '20:00',
      days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    },
    portfolio: [
      'https://images.pexels.com/photos/1576937/pexels-photo-1576937.jpeg',
      'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
      'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg'
    ],
    description: 'Специалист по классическим мужским стрижкам с опытом более 7 лет. Создаю стильные, практичные образы для современных мужчин.'
  },
  {
    id: '2',
    name: 'Максим Кузнецов',
    avatar: 'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg',
    rating: 4.9,
    reviewCount: 98,
    specialization: ['fade', 'pompadour', 'texture'],
    location: 'Бишкек, ул. Ахунбаева 119',
    workingHours: {
      from: '09:00',
      to: '21:00',
      days: ['Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    },
    portfolio: [
      'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg',
      'https://images.pexels.com/photos/2531734/pexels-photo-2531734.jpeg',
      'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg'
    ],
    description: 'Мастер современных стрижек с вниманием к деталям. Специализируюсь на сложных фейдах и текстурных стрижках.'
  },
  {
    id: '3',
    name: 'Руслан Доскеев',
    avatar: 'https://images.pexels.com/photos/1853958/pexels-photo-1853958.jpeg',
    rating: 4.7,
    reviewCount: 75,
    specialization: ['undercut', 'textured', 'trendy'],
    location: 'Бишкек, пр. Чуй 158',
    workingHours: {
      from: '11:00',
      to: '19:00',
      days: ['Пн', 'Ср', 'Чт', 'Пт', 'Сб']
    },
    portfolio: [
      'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
      'https://images.pexels.com/photos/1541695/pexels-photo-1541695.jpeg',
      'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg'
    ],
    description: 'Создаю трендовые молодежные стрижки. Люблю экспериментировать и находить уникальный стиль для каждого клиента.'
  }
];

export const filterOptions = {
  types: ['classic', 'fade', 'undercut', 'crop', 'pompadour', 'textured'],
  lengths: ['short', 'medium', 'long'],
  styles: ['business', 'casual', 'trendy', 'vintage', 'modern'],
  locations: ['Бишкек, Центр', 'Бишкек, Восток', 'Бишкек, Запад', 'Бишкек, Юг'],
};