import React from 'react';
import { MapPin, Phone, ExternalLink, Clock } from 'lucide-react';

interface Clinic {
  name: string;
  address: string;
  phone: string;
  mapQuery: string;
  qrCode?: string;
  qrLabel?: string;
}

const CLINICS: Clinic[] = [
  {
    name: '大塔院',
    address: '長崎県佐世保市大塔町1730-15',
    phone: '0956-37-9110',
    mapQuery: '長崎県佐世保市大塔町1730-15+えびす鍼灸整骨院大塔院',
  },
  {
    name: '早岐院',
    address: '長崎県佐世保市勝海町261-6',
    phone: '0956-56-3390',
    mapQuery: '長崎県佐世保市勝海町261-6+えびす鍼灸整骨院早岐院',
    // Using a placeholder QR code image service since the actual image file cannot be saved directly.
    // In a real scenario, replace this URL with the actual path to the uploaded QR code image.
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://line.me/ti/p/placeholder', 
    qrLabel: 'ご予約はこちら'
  },
  {
    name: '矢峰院',
    address: '長崎県佐世保市矢峰町223-5',
    phone: '0956-56-3921',
    mapQuery: '長崎県佐世保市矢峰町223-5+えびす鍼灸整骨院矢峰院',
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
              className="bg-white rounded-[2rem] p-8 shadow-soft hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-stone-100 flex flex-col h-full"
            >
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
                
                {/* QR Code Section */}
                {clinic.qrCode && (
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center text-center">
                    <p className="text-emerald-800 font-bold text-sm mb-3 flex items-center gap-2">
                       {clinic.qrLabel || 'QRコード'}
                    </p>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <img 
                        src={clinic.qrCode} 
                        alt={`${clinic.name} QR Code`} 
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-2">
                      スマホで読み取って予約
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <a 
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapQuery)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full flex items-center justify-center gap-2 bg-stone-50 border border-stone-200 text-stone-600 py-4 rounded-xl font-bold hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all text-sm group/btn"
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