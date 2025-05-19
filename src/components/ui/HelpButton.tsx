// src/components/ui/HelpButton.tsx
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-20 z-40 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Помощь"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Помощь</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Связаться с поддержкой</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Если у вас возникли вопросы или проблемы с использованием платформы, наша служба поддержки готова помочь.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/996700123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-[#25D366] text-white p-2 rounded-md"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="https://t.me/tarakhelp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-[#0088cc] text-white p-2 rounded-md"
                  >
                    Telegram
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Часто задаваемые вопросы</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-[#9A0F34] hover:underline">Как забронировать стрижку?</a>
                  </li>
                  <li>
                    <a href="#" className="text-[#9A0F34] hover:underline">Как стать барбером на платформе?</a>
                  </li>
                  <li>
                    <a href="#" className="text-[#9A0F34] hover:underline">Как изменить личные данные?</a>
                  </li>
                  <li>
                    <a href="#" className="text-[#9A0F34] hover:underline">Посмотреть все вопросы</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;