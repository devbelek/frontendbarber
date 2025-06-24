import { useState, useEffect, useRef } from "react";
import { Pencil, Trash, Eye, Plus, MoreVertical } from "lucide-react";
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
  const [error, setError] = useState<string>("");
  const notification = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchMyHaircuts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      setError(err.message || "Ошибка загрузки стрижек");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    console.log("Editing haircut ID:", id);
    navigate(`/edit-service/${id}`);
  };

  const handleDeleteClick = (id) => {
    console.log("Deleting haircut ID:", id);
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
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
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
        className="bg-red-50 rounded-lg p-6 text-center border border-red-200"
      >
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchMyHaircuts} variant="primary" size="sm">
          Попробовать снова
        </Button>
      </motion.div>
    );
  }

  if (haircuts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет стрижек в портфолио
          </h3>
          <p className="text-gray-500 mb-6">
            Добавьте свою первую работу в портфолио
          </p>
          <Button variant="primary" onClick={() => navigate("/add-service")}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить стрижку
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm mt-1">
            Управляйте своим портфолио ({haircuts.length})
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/add-service")}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {haircuts.map((haircut, index) => (
          <motion.div
            key={haircut.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05 }}
            className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
          >
            <div className="p-4">
              <div className="flex items-center space-x-4">
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {haircut.images && haircut.images.length > 0 ? (
                    <ImageWithFallback
                      src={haircut.images[0].image}
                      alt={haircut.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm sm:text-base">
                        Нет фото
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                        {haircut.title}
                      </h3>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className="text-lg font-bold text-[#9A0F34]">
                          {haircut.price} сом
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <Eye className="h-3 w-3 mr-1" />
                          {haircut.views || 0}
                        </span>
                      </div>
                      {haircut.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-1 sm:line-clamp-2">
                          {haircut.description}
                        </p>
                      )}
                    </div>

                    {/* Menu */}
                    <div className="relative ml-2" ref={menuRef}>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === haircut.id ? null : haircut.id
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>

                      <AnimatePresence>
                        {activeMenu === haircut.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40 z-50"
                          >
                            <button
                              onClick={() => handleEdit(haircut.id)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center text-gray-700 text-sm transition-colors"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDeleteClick(haircut.id)}
                              className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center text-red-600 text-sm transition-colors"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Удалить
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
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
