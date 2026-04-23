import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ArrowLeft, Image as ImageIcon, Loader2, X, CheckCircle2, Circle, Columns } from 'lucide-react';
import { RecordImage } from '../../types';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

export const ImageGalleryPage: React.FC = () => {
  const { clinicId, patientId, reservationId } = useParams<{ clinicId: string, patientId: string, reservationId: string }>();
  const flags = useFeatureFlags(clinicId);
  const navigate = useNavigate();
  const [images, setImages] = useState<RecordImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      if (!clinicId || !patientId) return;
      
      try {
        // Fetch images from patient's medical records
        // Note: In a real app, we might want to fetch from a dedicated images collection
        // or query records that have images. For this lightweight version, we'll fetch
        // recent records for the patient and extract images up to 15.
        const recordsRef = collection(db, `clinics/${clinicId}/records`);
        const q = query(
          recordsRef, 
          where('patientId', '==', Number(patientId)),
          orderBy('createdAt', 'desc'),
          limit(10) // Fetch last 10 records to find images
        );
        
        const snapshot = await getDocs(q);
        let allImages: RecordImage[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.images && Array.isArray(data.images)) {
            allImages = [...allImages, ...data.images];
          }
          if (data.imageGroups && Array.isArray(data.imageGroups)) {
            data.imageGroups.forEach((group: any) => {
              if (group.images && Array.isArray(group.images)) {
                allImages = [...allImages, ...group.images];
              }
            });
          }
        });

        // Limit to 15 images
        setImages(allImages.slice(0, 15));
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [clinicId, patientId]);

  const toggleSelection = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedForCompare.includes(url)) {
      setSelectedForCompare(prev => prev.filter(u => u !== url));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare(prev => [...prev, url]);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => isCompareMode ? setIsCompareMode(false) : navigate(-1)}
              className="p-2 -ml-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-stone-800 flex items-center gap-2">
              {isCompareMode ? (
                <>
                  <Columns size={18} className="text-stone-400" />
                  2枚比較
                </>
              ) : (
                <>
                  <ImageIcon size={18} className="text-stone-400" />
                  画像一覧 (最大15枚)
                </>
              )}
            </h1>
          </div>

          {/* 
            // TODO:
            // 外販時は tenantごとの画像容量制限、保存枚数制限を設ける
            // feature_flags で画像比較機能のON/OFFを切り替える
          */}
          {flags.enableImageComparison && !isCompareMode && (
            <button
              disabled={selectedForCompare.length !== 2}
              onClick={() => setIsCompareMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                selectedForCompare.length === 2
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Columns size={16} />
              2枚比較
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p>画像を読み込み中...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400 bg-white rounded-2xl border border-stone-200 border-dashed">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            <p className="font-bold">画像はありません</p>
          </div>
        ) : isCompareMode ? (
          <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)]">
            {selectedForCompare.map((url, i) => {
              const imageObj = images.find(img => img.url === url);
              const label = i === 0 ? 'Before' : 'After';
              return (
                <div key={url} className="flex-1 flex flex-col bg-stone-200 rounded-2xl overflow-hidden border border-stone-300 shadow-sm">
                  <div className="bg-stone-800 text-white text-center py-2 text-sm font-bold flex justify-between items-center px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${i === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                        {label}
                      </span>
                      {imageObj?.createdAt && (
                        <span className="text-stone-300 text-xs font-normal">
                          {formatDate(imageObj.createdAt)}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedForCompare(prev => prev.filter(u => u !== url));
                        if (selectedForCompare.length <= 1) setIsCompareMode(false);
                      }}
                      className="text-stone-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div 
                    className="flex-1 p-2 flex items-center justify-center cursor-pointer hover:bg-stone-300 transition-colors" 
                    onClick={() => setSelectedImage(url)}
                  >
                    <img 
                      src={url} 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm" 
                      referrerPolicy="no-referrer" 
                      alt={`${label}画像`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img, index) => {
              const selectionIndex = selectedForCompare.indexOf(img.url);
              const isSelected = selectionIndex !== -1;
              const canSelect = isSelected || selectedForCompare.length < 2;
              const label = selectionIndex === 0 ? 'Before' : selectionIndex === 1 ? 'After' : '';
              
              return (
                <div 
                  key={index}
                  className={`relative aspect-square bg-stone-200 rounded-xl overflow-hidden transition-all ${
                    isSelected ? 'border-[3px] border-emerald-500 shadow-md -translate-y-1' : 'border border-stone-200 shadow-sm hover:opacity-90'
                  }`}
                >
                  <img 
                    src={img.url} 
                    alt={`画像 ${index + 1}`} 
                    className="w-full h-full object-cover cursor-pointer"
                    referrerPolicy="no-referrer"
                    onClick={() => setSelectedImage(img.url)}
                  />
                  
                  {img.createdAt && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-4">
                      <span className="text-white text-xs font-medium drop-shadow-md">
                        {formatDate(img.createdAt)}
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={(e) => canSelect && toggleSelection(img.url, e)}
                    className={`absolute top-2 right-2 p-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${
                      isSelected 
                        ? 'text-emerald-600' 
                        : canSelect 
                          ? 'text-stone-400 hover:text-stone-600' 
                          : 'text-stone-300 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 size={24} className="fill-emerald-100" /> : <Circle size={24} />}
                  </button>

                  {isSelected && (
                    <div className={`absolute top-2 left-2 px-2 py-1 text-white rounded-md flex items-center justify-center text-xs font-bold shadow-sm ${selectionIndex === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                      {label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="拡大画像" 
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
