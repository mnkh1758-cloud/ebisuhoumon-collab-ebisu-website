import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const HaikiReservationPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-stone-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-600 mb-8">
            <span className="text-4xl">🟩</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-stone-800 mb-6">
            えびす鍼灸整骨院 早岐院｜施術予約
          </h1>
          
          <p className="text-stone-600 mb-12 text-lg">
            以下から予約システムへお進みください。
          </p>

          <Link
            to="/admin/haiki"
            className="w-full max-w-md mx-auto flex items-center justify-between bg-orange-500 text-white px-8 py-6 rounded-2xl font-bold hover:bg-orange-400 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👉</span>
              <span className="text-lg md:text-xl">早岐院の予約システムを開く</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ChevronRight size={20} />
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link to="/施術予約" className="text-stone-500 hover:text-green-600 font-medium transition-colors">
            ← 院選択へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
};
