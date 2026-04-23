import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  clinicName: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, clinicName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  // Preload images
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-stone-100 shadow-xl group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${clinicName} - ${currentIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
            onClick={() => setIsModalOpen(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-4 right-4 z-10 p-3 rounded-2xl bg-black/30 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50"
        >
          <Maximize2 size={20} />
        </button>

        {/* Image Counter Badge */}
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all snap-start ${
                currentIndex === index 
                  ? 'ring-2 ring-emerald-500 ring-offset-2 scale-95 opacity-100' 
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-10"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={32} />
            </button>

            {/* Modal Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.img
                key={`modal-${currentIndex}`}
                src={images[currentIndex]}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="max-w-full max-h-full object-contain"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) handlePrev();
                  else if (info.offset.x < -100) handleNext();
                }}
              />

              {/* Modal Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors hidden md:block"
                  >
                    <ChevronLeft size={64} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors hidden md:block"
                  >
                    <ChevronRight size={64} />
                  </button>
                </>
              )}
            </div>

            {/* Modal Caption/Thumbnails */}
            <div className="mt-6 flex flex-col items-center gap-4">
              <p className="text-white font-bold text-lg">{clinicName} - ギャラリー</p>
              <div className="flex gap-2 overflow-x-auto max-w-full px-4">
                {images.map((img, index) => (
                  <button
                    key={`modal-thumb-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      currentIndex === index ? 'ring-2 ring-emerald-400 scale-110' : 'opacity-40'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
