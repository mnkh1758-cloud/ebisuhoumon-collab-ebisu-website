import React from 'react';
import { MapPin, Phone, ExternalLink, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyGallery } from '../components/PropertyGallery';

// Custom LINE Icon Component
const LineIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.572-3.843 2.572-6.022zm-4.269 2.42h-4.384c-.266 0-.486.215-.486.476v1.959c0 .266.219.485.486.485h4.384c.267 0 .486-.219.486-.485v-1.959c0-.261-.219-.476-.486-.476zm-7.662 0h-1.623c-.266 0-.485.215-.485.476v1.959c0 .266.219.485.485.485h1.623c.266 0 .485-.219.485-.485v-1.959c0-.261-.219-.476-.485-.476zm5.131-3.65h-6.754c-.266 0-.485.215-.485.476v1.959c0 .266.219.485.485.485h6.754c.267 0 .486-.219.486-.485v-1.959c0-.261-.219-.476-.486-.476z"/>
  </svg>
);

interface Clinic {
  id: string;
  name: string;
  englishName: string;
  address: string;
  phone: string;
  mapQuery: string;
  images: string[];
  lineUrl: string;
}

const CLINICS: Clinic[] = [
  {
    id: 'daitou',
    name: '大塔院',
    englishName: 'Daito Seikotuin',
    address: '長崎県佐世保市大塔町1730-15',
    phone: '0956-37-9110',
    mapQuery: '長崎県佐世保市大塔町1730-15+えびす鍼灸整骨院大塔院',
    images: [
      'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/daitougaikan.jpg.webp?raw=true',
      'https://picsum.photos/seed/daito1/1600/1000',
      'https://picsum.photos/seed/daito2/1600/1000',
      'https://picsum.photos/seed/daito3/1600/1000'
    ],
    lineUrl: 'https://lin.ee/VDIACsk',
  },
  {
    id: 'haiki',
    name: '早岐院',
    englishName: 'Haiki Seikotuin',
    address: '長崎県佐世保市勝海町261-6',
    phone: '0956-56-3390',
    mapQuery: '長崎県佐世保市勝海町261-6+えびす鍼灸整骨院早岐院',
    images: [
      'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/haikigaikan.webp?raw=true',
      'https://picsum.photos/seed/haiki1/1600/1000',
      'https://picsum.photos/seed/haiki2/1600/1000',
      'https://picsum.photos/seed/haiki3/1600/1000'
    ],
    lineUrl: 'https://lin.ee/SAn5hgK',
  },
  {
    id: 'yamine',
    name: '矢峰院',
    englishName: 'Yamine Seikotuin',
    address: '長崎県佐世保市矢峰町223-5',
    phone: '0956-56-3921',
    mapQuery: '長崎県佐世保市矢峰町223-5+えびす鍼灸整骨院矢峰院',
    images: [
      'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/yaminegaikan.jpg.webp?raw=true',
      'https://picsum.photos/seed/yamine1/1600/1000',
      'https://picsum.photos/seed/yamine2/1600/1000',
      'https://picsum.photos/seed/yamine3/1600/1000'
    ],
    lineUrl: 'https://lin.ee/DHQcTRp',
  },
];

export const Access: React.FC = () => {
  return (
    <section id="access" className="py-32 bg-stone-100 relative">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-stone-50 to-transparent"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
           <div className="max-w-2xl">
            <span className="text-emerald-600 font-bold text-xs tracking-[0.2em] uppercase block mb-3">Locations</span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-stone-800 mb-6">
              アクセス・店舗情報
            </h2>
            <p className="text-stone-600 leading-loose text-lg">
              長崎県佐世保市内に3店舗を展開。<br />
              お住まいや職場から通いやすい「えびす鍼灸整骨院」へ。
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex items-start gap-4 max-w-sm">
             <div className="p-3 bg-stone-100 rounded-full text-emerald-800">
               <Clock size={24} />
             </div>
             <div>
               <h4 className="font-bold text-stone-800 mb-2">診療時間</h4>
               <ul className="text-sm text-stone-600 space-y-1">
                 <li className="flex justify-between w-48"><span className="font-medium">平日</span> <span>9:00-13:00 / 15:00-20:00</span></li>
                 <li className="flex justify-between w-48"><span className="font-medium">土曜</span> <span>9:00-14:00</span></li>
                 <li className="text-xs text-stone-400 pt-1">※日祝休診 / 店舗により異なる場合あり</li>
               </ul>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CLINICS.map((clinic, index) => (
            <div 
              key={index} 
              className="bg-white rounded-[2rem] p-8 shadow-soft hover:shadow-xl transition-all duration-300 group border border-stone-100 flex flex-col h-full overflow-hidden"
            >
              <div className="mb-8">
                <PropertyGallery images={clinic.images} clinicName={clinic.name} />
              </div>

              <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-100">
                <h3 className="text-2xl font-bold font-serif text-emerald-900">
                  {clinic.name}
                </h3>
                <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MapPin size={20} />
                </span>
              </div>
              
              <div className="space-y-8 flex-1">
                <div>
                  <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
                    Address
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-700 hover:text-emerald-700 transition-colors flex items-start gap-1 font-medium leading-relaxed"
                  >
                    {clinic.address}
                  </a>
                </div>

                <div>
                   <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">
                    Tel
                  </div>
                  <a 
                    href={`tel:${clinic.phone.replace(/-/g, '')}`}
                    className="text-3xl font-bold text-emerald-800 hover:text-emerald-600 transition-colors font-mono tracking-tight"
                  >
                    {clinic.phone}
                  </a>
                </div>

                {/* LINE Contact Button */}
                <div>
                  <a 
                    href={clinic.lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05b34c] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg group/line"
                  >
                    <LineIcon className="w-6 h-6 fill-current" />
                    <span>LINEでお問い合わせ</span>
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100 space-y-4">
                <Link 
                  to={`/staff/${clinic.id}`}
                  className="w-full flex items-center justify-between bg-emerald-50 border border-emerald-100 text-emerald-800 px-6 py-4 rounded-xl font-bold hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all text-sm group/btn shadow-sm"
                >
                  スタッフ紹介を見る
                  <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </Link>

                <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapQuery)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full flex items-center justify-center gap-2 bg-stone-50 border border-stone-200 text-stone-600 py-4 rounded-xl font-bold hover:bg-stone-600 hover:border-stone-600 hover:text-white transition-all text-sm group/btn"
                >
                  Google Map
                  <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};