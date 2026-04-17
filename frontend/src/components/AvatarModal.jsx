// components/AvatarModal.jsx - WhatsApp Style
import React, { useEffect } from "react";
import { XIcon, ChevronLeft } from "lucide-react";

const AvatarModal = ({ image, name, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!image) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Header with Close Button */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        {name && (
          <h3 className="text-white font-semibold text-lg truncate max-w-[70%]">
            {name}
          </h3>
        )}
        <div className="w-10" />
      </div>

      {/* Centered Image */}
      <div className="flex items-center justify-center w-full h-full p-4">
        <div 
          className="relative animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={image}
            alt={name}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            onError={(e) => {
              e.target.src = "/avatar.png";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;