import React from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";
import { useLanguage } from "../../context/LanguageContext";
import HaircutCard from "../haircuts/HaircutCard"; // Assuming HaircutCard is in the same directory
import { Haircut } from "../../types";

interface HaircutSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  haircuts: Haircut[];
  onSelectHaircut: (haircut: Haircut) => void;
}

const HaircutSelectionModal: React.FC<HaircutSelectionModalProps> = ({
  isOpen,
  onClose,
  haircuts,
  onSelectHaircut,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-2xl md:max-w-4xl mx-auto flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#9a0f34] to-[#6b0824] text-white p-3 sm:p-4 md:p-5 rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-100 hover:text-white"
            aria-label={t("closeModal")}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold">
            {t("Выберите стрижку")}
          </h2>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3 md:p-4 flex-1 overflow-y-auto">
          {haircuts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {haircuts.map((haircut) => (
                <HaircutCard
                  key={haircut.id}
                  haircut={haircut}
                  onBookClick={onSelectHaircut}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                {t("noHaircutsAvailable")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 md:p-5 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#9a0f34] text-xs sm:text-sm"
          >
            {t("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HaircutSelectionModal;
