import { useEffect, useState } from 'react';
import axios from '@/api/client';

interface Banner {
  id: number;
  desktop_image: string;
  mobile_image: string;
}

const Banner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get('/services/banners/');
        if (response.data.length > 0) {
          setBanner(response.data[0]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке баннера', error);
      }
    };

    fetchBanner();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!banner) return null;

  const imageUrl = isMobile ? banner.mobile_image : banner.desktop_image;

  return (
    <div className="relative w-full max-w-full mx-auto">
      <img
        src={imageUrl}
        alt="Баннер"
        className="w-full h-auto object-cover rounded-2xl shadow-lg"
        style={{ maxHeight: '50vh', minHeight: '200px' }}
      />
    </div>
  );
};

export default Banner;