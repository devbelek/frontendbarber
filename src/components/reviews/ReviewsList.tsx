import React, { useState, useEffect } from "react";
import { Star, MessageSquare, User } from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { reviewsAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { Review } from "../../types";

interface ReviewsListProps {
  barberId: string;
  canAddReview?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  barberId,
  canAddReview = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const notification = useNotification();

  useEffect(() => {
    fetchReviews();
  }, [barberId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getForBarber(barberId);

      if (response.data) {
        const reviewsData = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setReviews(reviewsData);
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);

      // Если ошибка 401, показываем пустой список вместо ошибки
      if (error.response?.status === 401) {
        setReviews([]);
      } else {
        notification.error("Ошибка", "Не удалось загрузить отзывы");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      notification.info("Требуется вход", "Чтобы оставить отзыв, необходимо войти в систему");
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.create({
        barber: barberId,
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });

      notification.success("Успешно", "Ваш отзыв добавлен");
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (error: any) {
      if (error.response?.data?.non_field_errors?.[0]?.includes("unique")) {
        notification.error("Ошибка", "Вы уже оставляли отзыв этому барберу");
      } else {
        notification.error("Ошибка", "Не удалось добавить отзыв");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canAddReview && isAuthenticated && !showReviewForm && (
        <Button
          variant="primary"
          onClick={() => setShowReviewForm(true)}
          className="mb-4"
        >
          Оставить отзыв
        </Button>
      )}

      {showReviewForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Ваш отзыв</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оценка
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= newReview.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  placeholder="Поделитесь своим опытом..."
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !newReview.comment.trim()}
                >
                  {submitting ? "Отправка..." : "Отправить"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({ rating: 5, comment: "" });
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {isAuthenticated ? "Пока нет отзывов. Будьте первым!" : "Пока нет отзывов"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.author_details?.profile?.photo ? (
                      <img
                        src={review.author_details.profile.photo}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">
                        {review.author_details?.first_name || review.author_details?.username || "Пользователь"}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;