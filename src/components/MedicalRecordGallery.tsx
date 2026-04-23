import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Columns, 
  Calendar, 
  User,
  LayoutGrid,
  History,
  ArrowRightLeft
} from 'lucide-react';
import { MedicalRecord, RecordImage } from '../types';

interface MedicalRecordGalleryProps {
  records: MedicalRecord[];
  onClose: () => void;
  initialImage?: string;
}

interface FlattenedImage {
  url: string;
  date: string;
  staffName: string;
  label: string;
  recordId: string;
  isProtected?: boolean;
}

export const MedicalRecordGallery: React.FC<MedicalRecordGalleryProps> = ({ records, onClose, initialImage }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [compareImages, setCompareImages] = useState<[number | null, number | null]>([null, null]);

  // Flatten all images from all records for easy navigation
  const allImages = useMemo(() => {
    const flattened: FlattenedImage[] = [];
    // Records are already sorted by date desc in PatientDetail
    records.forEach(record => {
      // Legacy images
      if (record.images) {
        record.images.forEach(img => {
          flattened.push({
            url: img.url,
            date: record.date,
            staffName: record.staffName || '',
            label: '一般',
            recordId: record.id,
            isProtected: img.isProtected
          });
        });
      }
      // Grouped images
      if (record.imageGroups) {
        record.imageGroups.forEach(group => {
          group.images.forEach(img => {
            flattened.push({
              url: img.url,
              date: record.date,
              staffName: record.staffName || '',
              label: group.label,
              recordId: record.id,
              isProtected: img.isProtected
            });
          });
        });
      }
    });
    return flattened;
  }, [records]);

  // Set initial image if provided
  React.useEffect(() => {
    if (initialImage) {
      const index = allImages.findIndex(img => img.url === initialImage);
      if (index !== -1) setSelectedImageIndex(index);
    }
  }, [initialImage, allImages]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % allImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + allImages.length) % allImages.length);
  };

  const toggleCompare = (index: number) => {
    setCompareImages(prev => {
      if (prev[0] === index) return [prev[1], null];
      if (prev[1] === index) return [prev[0], null];
      if (prev[0] === null) return [index, prev[1]];
      return [prev[0], index];
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-6">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <History className="text-emerald-400" size={20} />
            カルテ画像ギャラリー
          </h2>
          <div className="flex bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              <LayoutGrid size={16} /> 一覧
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'compare' ? 'bg-white text-stone-900 shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              <Columns size={16} /> 比較
            </button>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allImages.map((img, index) => (
              <motion.div
                key={`${img.recordId}-${index}`}
                layoutId={`img-${index}`}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-800 border border-white/5 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img 
                  src={img.url} 
                  alt={img.label} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">{img.date}</div>
                  <div className="text-xs text-white font-bold truncate">{img.label}</div>
                </div>
                {img.isProtected && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                    保護
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
              {[0, 1].map(slot => (
                <div key={slot} className="relative rounded-3xl bg-stone-800/50 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden">
                  {compareImages[slot] !== null ? (
                    <>
                      <img 
                        src={allImages[compareImages[slot]!].url} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-400">{allImages[compareImages[slot]!].date}</span>
                          <span className="text-[10px] text-white/60">{allImages[compareImages[slot]!].staffName}</span>
                        </div>
                        <div className="text-sm font-bold">{allImages[compareImages[slot]!].label}</div>
                      </div>
                      <button 
                        onClick={() => setCompareImages(prev => {
                          const next = [...prev] as [number | null, number | null];
                          next[slot] = null;
                          return next;
                        })}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mx-auto mb-4">
                        <Columns size={32} />
                      </div>
                      <p className="text-white/40 font-bold">比較する画像を選択してください</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selection Strip for Comparison */}
            <div className="shrink-0 bg-white/5 rounded-3xl p-4 border border-white/10">
              <div className="text-xs font-bold text-white/40 mb-3 uppercase tracking-widest">画像を選択</div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {allImages.map((img, index) => {
                  const isSelected = compareImages.includes(index);
                  const slotIndex = compareImages.indexOf(index);
                  return (
                    <button
                      key={`select-${index}`}
                      onClick={() => toggleCompare(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${
                        isSelected ? 'ring-4 ring-emerald-500 scale-90' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                            {slotIndex + 1}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal (Expansion) */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/98 flex flex-col"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="absolute top-6 right-6 z-[120] flex gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompare(selectedImageIndex);
                  setSelectedImageIndex(null);
                  setViewMode('compare');
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold transition-all"
              >
                <ArrowRightLeft size={18} /> 比較に追加
              </button>
              <button 
                onClick={() => setSelectedImageIndex(null)}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4">
              <motion.img
                key={`modal-${selectedImageIndex}`}
                src={allImages[selectedImageIndex].url}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-full max-h-full object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                referrerPolicy="no-referrer"
              />

              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white/30 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={64} />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white/30 hover:text-white transition-colors"
                  >
                    <ChevronRight size={64} />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer Info */}
            <div className="p-8 bg-gradient-to-t from-black/80 to-transparent text-center">
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Calendar size={16} /> {allImages[selectedImageIndex].date}
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="text-white font-bold">{allImages[selectedImageIndex].label}</div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <User size={16} /> {allImages[selectedImageIndex].staffName}
                </div>
              </div>
              <div className="mt-4 text-white/40 text-xs font-bold">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
