import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';
import { reviewsAPI } from '../../api/services';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface ReviewsListProps {
  barberId: string;
  canAddReview?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ barberId, canAddReview = false }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const notification = useNotification();

  useEffect(() => {
    fetchReviews();
  }, [barberId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getForBarber(barberId);

      let reviewsData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          reviewsData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          reviewsData = response.data.results;
        }
      }

      setReviews(reviewsData);

      // Проверяем, оставлял ли текущий пользователь отзыв
      if (user && reviewsData.length > 0) {
        const userReview = reviewsData.find(review =>
          review.author === user.id || review.author_details?.id === user.id
        );
        setHasUserReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      notification.error('Ошибка', 'Пожалуйста, напишите комментарий');
      return;
    }

    try {
      await reviewsAPI.create({
        barber: barberId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      notification.success('Успешно', 'Отзыв добавлен');
      setShowAddReview(false);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.non_field_errors) {
        notification.error('Ошибка', 'Вы уже оставляли отзыв для этого барбера');
      } else {
        notification.error('Ошибка', 'Не удалось добавить отзыв');
      }
    }
  };

  const StarRating = ({ rating, onChange = null, size = 'md' }: any) => {
    const sizes: any = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange && onChange(star)}
            disabled={!onChange}
            className={onChange ? 'cursor-pointer' : 'cursor-default'}
            type="button"
          >
            <Star
              className={`${sizes[size]} ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Проверяем, может ли пользователь добавить отзыв
  const canUserAddReview = isAuthenticated &&
    user?.profile?.user_type === 'client' &&
    canAddReview &&
    !hasUserReviewed;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Отзывы ({reviews.length})</h3>
        {canUserAddReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddReview(!showAddReview)}
          >
            Добавить отзыв
          </Button>
        )}
        {hasUserReviewed && (
          <p className="text-sm text-gray-500">Вы уже оставили отзыв</p>
        )}
      </div>

      {!isAuthenticated && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-700 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Войдите в систему как клиент, чтобы оставить отзыв
          </p>
        </div>
      )}

      {user?.profile?.user_type === 'barber' && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-yellow-700">
            Барберы не могут оставлять отзывы. Переключитесь на аккаунт клиента в профиле.
          </p>
        </div>
      )}

      {showAddReview && canUserAddReview && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ваша оценка
            </label>
            <StarRating
              rating={newReview.rating}
              onChange={(rating: number) => setNewReview({ ...newReview, rating })}
              size="lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Комментарий
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
              placeholder="Поделитесь своим опытом..."
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSubmitReview}>
              Отправить
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddReview(false);
                setNewReview({ rating: 5, comment: '' });
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Пока нет отзывов. Будьте первым!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {review.author_details?.first_name || 'Аноним'} {review.author_details?.last_name || ''}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <StarRating rating={review.rating} size="sm" />
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;