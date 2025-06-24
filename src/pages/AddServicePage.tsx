import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Card, { CardContent } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { servicesAPI } from "../api/services";

const AddServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    duration: "30",
    type: "classic",
    length: "short",
    style: "business",
    location: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Редирект, если пользователь не барбер
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.profile?.user_type !== "barber") {
      navigate("/profile");
    }

    // Предзаполняем адрес из профиля пользователя
    if (user?.profile?.address) {
      setFormData((prev) => ({
        ...prev,
        location: user.profile?.address || "",
      }));
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Проверка типа файлов
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      const invalidFiles = files.filter(
        (file) => !allowedTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        setError(
          "Некоторые файлы имеют неверный формат. Поддерживаются только JPEG, PNG и GIF"
        );
        return;
      }

      // Проверка размера файлов
      const oversizedFiles = files.filter(
        (file) => file.size > 5 * 1024 * 1024
      );

      if (oversizedFiles.length > 0) {
        setError("Некоторые файлы превышают максимальный размер 5MB");
        return;
      }

      // Ограничение на количество файлов
      if (images.length + files.length > 5) {
        setError("Максимум 5 изображений");
        return;
      }

      setError(null);
      setImages((prev) => [...prev, ...files]);

      // Создаем preview URLs
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const newPreviews = [...previewUrls];

    const [removedImage] = newImages.splice(fromIndex, 1);
    const [removedPreview] = newPreviews.splice(fromIndex, 1);

    newImages.splice(toIndex, 0, removedImage);
    newPreviews.splice(toIndex, 0, removedPreview);

    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  // Исправленная функция handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Валидация
      if (!formData.title.trim()) {
        setError("Пожалуйста, введите название услуги");
        setLoading(false);
        return;
      }

      if (!formData.price.trim() || isNaN(Number(formData.price))) {
        setError("Пожалуйста, введите корректную цену");
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        setError("Пожалуйста, загрузите хотя бы одно фото работы");
        setLoading(false);
        return;
      }

      // Создаем FormData для отправки файлов
      const serviceData = new FormData();
      serviceData.append("title", formData.title.trim());
      serviceData.append("price", formData.price.trim());
      serviceData.append("duration", formData.duration);
      serviceData.append("type", formData.type);
      serviceData.append("length", formData.length);
      serviceData.append("style", formData.style);
      serviceData.append("location", formData.location.trim());
      serviceData.append("description", formData.description.trim());

      // Явно добавляем ID барбера если он доступен
      if (user && user.id) {
        serviceData.append("barber", user.id.toString());
      }

      // Важно! API ожидает "uploaded_images", а не "images"
      images.forEach((image) => {
        serviceData.append("uploaded_images", image);
      });

      console.log("Sending data to server:", Array.from(serviceData.entries()));

      // Отправляем на сервер
      const response = await servicesAPI.create(serviceData);
      console.log("Успешный ответ:", response);

      // Обновляем данные пользователя
      if (refreshUserData) {
        await refreshUserData();
      }

      setSuccess("Услуга успешно добавлена!");

      // Сбрасываем форму
      setFormData({
        title: "",
        price: "",
        duration: "30",
        type: "classic",
        length: "short",
        style: "business",
        location: user?.profile?.address || "",
        description: "",
      });
      setImages([]);
      setPreviewUrls([]);

      // Редирект на профиль после небольшой задержки
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating service:", err);

      // Более детальная обработка ошибок
      let errorMessage =
        "Не удалось создать услугу. Пожалуйста, попробуйте позже.";

      if (err.response?.data) {
        // Проверяем, есть ли подробности об ошибке
        if (typeof err.response.data === "object") {
          // Преобразуем все возможные поля ошибок в строку
          const errorFields = Object.keys(err.response.data);
          const errorDetails = errorFields
            .map((field) => {
              const errorValue = err.response.data[field];
              if (Array.isArray(errorValue)) {
                return `${field}: ${errorValue.join(", ")}`;
              }
              return `${field}: ${errorValue}`;
            })
            .join("\n");

          if (errorDetails) {
            errorMessage = errorDetails;
          }
        } else if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout openLoginModal={() => {}}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Добавить новую услугу</h1>
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Вернуться в профиль
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фото работы (максимум 5)
                </label>

                {/* Превью загруженных изображений */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />

                        {/* Кнопки управления */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center space-x-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="p-1 bg-white rounded-full"
                            >
                              ←
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index < previewUrls.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              className="p-1 bg-white rounded-full"
                            >
                              →
                            </button>
                          )}
                        </div>

                        {/* Метка первого изображения */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-[#9A0F34] text-white text-xs px-2 py-1 rounded">
                            Основное
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Область загрузки */}
                {previewUrls.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="service-images"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="service-images"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Нажмите, чтобы загрузить фото
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        (JPG, PNG, GIF, максимум 5MB на файл)
                      </span>
                    </label>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Первое изображение будет использоваться как основное
                </p>
              </div>

              {/* Остальные поля формы остаются без изменений */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название услуги
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Например: Классический фейд"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (сом)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Длительность
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  >
                    <option value="30">30 минут</option>
                    <option value="45">45 минут</option>
                    <option value="60">1 час</option>
                    <option value="90">1.5 часа</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип стрижки
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  >
                    <option value="classic">Классическая</option>
                    <option value="fade">Фейд</option>
                    <option value="undercut">Андеркат</option>
                    <option value="crop">Кроп</option>
                    <option value="pompadour">Помпадур</option>
                    <option value="textured">Текстурная</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Длина волос
                  </label>
                  <select
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  >
                    <option value="short">Короткие</option>
                    <option value="medium">Средние</option>
                    <option value="long">Длинные</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Стиль
                  </label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  >
                    <option value="business">Деловой</option>
                    <option value="casual">Повседневный</option>
                    <option value="trendy">Трендовый</option>
                    <option value="vintage">Винтажный</option>
                    <option value="modern">Современный</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес барбершопа
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Например: Бишкек, ул. Киевская 95"
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Добавьте описание услуги..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Сохранение..." : "Добавить услугу"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddServicePage;
