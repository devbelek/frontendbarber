import { useState, useEffect } from "react";
import { Pencil, Trash, Eye, Plus, MoreVertical, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { servicesAPI } from "../../api/services";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useNotification } from "../../context/NotificationContext";
import ImageWithFallback from "../ui/ImageWithFallback";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Haircut } from "../../types";

const MyHaircuts = () => {
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notification = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchMyHaircuts();
  }, []);

  const fetchMyHaircuts = async () => {
    try {
      setLoading(true);
      const barberId = user?.id;
      if (!barberId) {
        throw new Error("Не удалось определить ID барбера");
      }

      const response = await servicesAPI.getAll({ barber: barberId });
      if (response.data) {
        let results = response.data;
        if (response.data.results && Array.isArray(response.data.results)) {
          results = response.data.results;
        }
        setHaircuts(Array.isArray(results) ? results : []);
      } else {
        setHaircuts([]);
      }
    } catch (err) {
      console.error("Failed to load haircuts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: any) => {
    navigate(`/edit-service/${id}`);
  };

  const handleDeleteClick = (id: any) => {
    setServiceToDelete(id);
    setDeleteConfirmOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      await servicesAPI.delete(serviceToDelete);
      notification.success("Успешно", "Стрижка удалена из вашего портфолио");
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      fetchMyHaircuts();
    } catch (err) {
      console.error("Failed to delete haircut:", err);
      notification.error("Ошибка", "Не удалось удалить стрижку");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setServiceToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 rounded-2xl p-8 text-center"
      >
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchMyHaircuts} variant="primary">
          Попробовать снова
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Мои стрижки
          </h3>
          <p className="text-gray-500 mt-1">Управляйте своим портфолио</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/add-service")}
          className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {haircuts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#9A0F34] to-[#7b0c29] rounded-full flex items-center justify-center mx-auto mb-6">
            <Scissors className="h-10 w-10 text-white" />
          </div>
          <h4 className="text-xl font-semibold mb-2">
            Начните создавать портфолио
          </h4>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Добавьте свою первую стрижку, чтобы клиенты могли увидеть ваши
            работы
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/add-service")}
            className="shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить первую стрижку
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {haircuts.map((haircut, index) => (
              <motion.div
                key={haircut.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden mr-6 group-hover:scale-105 transition-transform duration-300">
                      {haircut.images.map((item, index) => (
                        <ImageWithFallback
                          key={index}
                          src={item.image}
                          alt="image"
                          className="w-full h-full object-cover"
                        />
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {haircut.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="text-2xl font-bold text-[#9A0F34]">
                          {haircut.price} сом
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {haircut.views || 0} просмотров
                        </span>
                      </div>
                      {haircut.description && (
                        <p className="text-gray-600 mt-2 line-clamp-2">
                          {haircut.description}
                        </p>
                      )}
                    </div>

                    <div className="relative ml-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      <AnimatePresence>
                        {activeMenu === haircut.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 z-10"
                          >
                            <button
                              onClick={() => handleEdit(haircut.id)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700 transition-colors"
                            >
                              <Pencil className="h-4 w-4 mr-3" />
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDeleteClick(haircut.id)}
                              className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center text-red-600 transition-colors"
                            >
                              <Trash className="h-4 w-4 mr-3" />
                              Удалить
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Удаление стрижки"
        message="Вы уверены, что хотите удалить эту стрижку? Это действие невозможно отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmVariant="danger"
      />
    </div>
  );
};

export default MyHaircuts;
