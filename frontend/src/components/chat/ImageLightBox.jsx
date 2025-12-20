import React from "react";

const ImageLightbox = ({ selectedImg, setSelectedImg }) => {
  if (!selectedImg) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 transition-opacity"
      onClick={() => setSelectedImg(null)}
    >
      <button className="absolute top-5 right-5 text-white hover:text-cyan-400 transition-colors">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <img
        src={selectedImg}
        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
        alt="Zoomed"
      />
    </div>
  );
};

export default ImageLightbox;