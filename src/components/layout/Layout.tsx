import { useState, useEffect, FC } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileNavigation from "./MobileNavigation";
import FloatingActionButton from "../ui/FloatingActionButton";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import InstallModal from "../ui/InstallModal";

interface LayoutProps {
  children: React.ReactNode;
  openLoginModal: () => void;
}

// Тип для deferredPrompt
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const Layout: FC<LayoutProps> = ({ children, openLoginModal }) => {
  const location = useLocation();
  const { user } = useAuth();

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Обновляем isMobile на монтировании
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // первичная установка
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isBarber = user?.profile?.user_type === "barber";
  const isAddEditServicePage =
    location.pathname === "/add-service" ||
    location.pathname.startsWith("/edit-service/");

  // Обработка установки PWA
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallModalOpen(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Пользователь установил приложение");
        } else {
          console.log("Пользователь отказался от установки");
        }
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
      });
    }
  };

  const closeInstallModal = () => {
    setIsInstallModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header openLoginModal={openLoginModal} />
      <main className={`flex-grow ${isMobile ? "pb-16" : ""}`}>{children}</main>
      <Footer />

      {isMobile && <MobileNavigation openLoginModal={openLoginModal} />}

      {isBarber && !isAddEditServicePage && (
        <FloatingActionButton
          to="/add-service"
          icon={<Plus className="h-6 w-6" />}
          label="Добавить стрижку"
        />
      )}

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={closeInstallModal}
        onInstall={handleInstall}
      />
    </div>
  );
};

export default Layout;
