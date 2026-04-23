import React, { useEffect } from 'react';
import { ArrowLeft, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StaffSelect: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const clinics = [
    {
      id: 'haiki',
      name: '早岐院',
      englishName: 'Haiki Clinic',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
      tel: '0956-56-3390',
      address: '長崎県佐世保市勝海町261-6'
    },
    {
      id: 'daito',
      name: '大塔院',
      englishName: 'Daito Clinic',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
      tel: '0956-37-9110',
      address: '長崎県佐世保市大塔町1730-15'
    },
    {
      id: 'yamine',
      name: '矢峰院',
      englishName: 'Yamine Clinic',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
      tel: '0956-56-3921',
      address: '長崎県佐世保市矢峰町223-5'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pt-24 pb-20">
      <div className="container mx-auto px-6">
        {/* Breadcrumb / Back */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors font-bold text-sm">
            <ArrowLeft size={16} />
            トップページに戻る
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-bold text-xs tracking-[0.3em] uppercase block mb-3">Select Clinic</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">店舗を選択してください</h1>
          <div className="w-12 h-1 bg-emerald-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Clinic Selection Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {clinics.map((clinic) => (
            <Link 
              key={clinic.id} 
              to={`/staff/${clinic.id}`}
              className="group bg-white rounded-[2rem] overflow-hidden shadow-lg border border-stone-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors z-10"></div>
                <img 
                  src={clinic.image} 
                  alt={clinic.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="text-white text-xs font-bold tracking-widest uppercase bg-emerald-600/90 px-3 py-1 rounded-full backdrop-blur-sm">
                    {clinic.englishName}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold font-serif text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">
                  {clinic.name}
                </h2>
                <div className="space-y-3 mb-6 flex-1">
                   <p className="flex items-start gap-2 text-stone-500 text-sm">
                     <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                     {clinic.address}
                   </p>
                </div>
                
                <div className="flex items-center justify-between text-emerald-600 font-bold text-sm border-t border-stone-100 pt-4 group-hover:text-emerald-700">
                  スタッフ紹介を見る
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
