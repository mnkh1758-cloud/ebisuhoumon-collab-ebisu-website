import React, { useState } from 'react';
import { SERVICES } from '../constants';
import { Check, ArrowRight, X, Baby, Thermometer, Zap, Heart, Info, MapPin } from 'lucide-react';

export const Services: React.FC = () => {
  const [isNinkatsuModalOpen, setIsNinkatsuModalOpen] = useState(false);

  return (
    <section id="services" className="py-32 bg-emerald-950 text-stone-100 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-800/20 rounded-full blur-[120px]"></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-px bg-emerald-500"></span>
              <span className="text-emerald-400 font-bold tracking-[0.2em] text-xs uppercase">Our Menu</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-white leading-tight">
              施術メニュー
            </h2>
            <p className="text-emerald-100/70 leading-relaxed text-lg font-light">
              患者様一人ひとりの症状に合わせたオーダーメイド治療。<br />
              痛みの原因の根本改善から、妊活・産後ケアまで幅広く対応します。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <div 
              key={service.id} 
              className="relative rounded-[2rem] p-8 md:p-10 transition-all duration-500 group flex flex-col overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20"
            >
              {/* Ninkatsu Background Image specific style */}
              {service.id === 'svc4' && (
                <div className="absolute inset-0 -z-10 opacity-30">
                  <img 
                    src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/ninpu.jpg.webp?raw=true" 
                    alt="Fertility Care Background" 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-emerald-950/80"></div>
                </div>
              )}
              
              <div className="mb-6 relative pt-4">
                <h3 className="text-2xl font-bold font-serif mb-2 flex items-center flex-wrap gap-2 text-stone-100">
                  {service.title}
                  {index === 0 && (
                     <span className="flex items-center gap-1 text-xs bg-amber-400 text-amber-950 px-2 py-1 rounded-md font-bold ml-1 font-sans">
                       <span>👑</span> 人気No.1
                     </span>
                  )}
                  {service.id === 'svc4' && <Baby size={24} className="text-pink-300" />}
                </h3>
                <div className={`w-12 h-1 rounded-full ${service.id === 'svc4' ? 'bg-pink-400' : 'bg-emerald-500/50'}`}></div>
              </div>
              
              <p className="text-sm mb-8 min-h-[4em] leading-relaxed text-stone-300">
                {service.description}
              </p>
              
              <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-white/10">
                <span className="text-4xl font-bold font-serif text-white tracking-tight">{service.price}</span>
                <span className="text-sm text-emerald-400 font-medium">/ {service.duration}</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm group/item">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors bg-white/10 text-stone-300 group-hover/item:bg-emerald-500/20 group-hover/item:text-emerald-300
                      ${service.id === 'svc4' ? 'bg-pink-500/20 text-pink-300 group-hover/item:bg-pink-500/40' : ''}
                    `}>
                      <Check size={14} />
                    </div>
                    <span className="text-stone-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {service.id === 'svc4' && (
                <button 
                  onClick={() => setIsNinkatsuModalOpen(true)}
                  className="w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-pink-500/20 text-pink-100 border border-pink-400/30 hover:bg-pink-500/40 hover:border-pink-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] relative overflow-hidden group/btn"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Baby size={18} />
                    妊活ケアについて詳しく
                  </span>
                  <ArrowRight size={16} className="opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all relative z-10" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ninkatsu Modal */}
      {isNinkatsuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div 
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setIsNinkatsuModalOpen(false)}
          ></div>
          
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-fade-in-up flex flex-col md:flex-row text-stone-800">
            
            <button 
              onClick={() => setIsNinkatsuModalOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 backdrop-blur rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal Image */}
            <div className="w-full md:w-1/3 relative h-48 md:h-auto shrink-0">
              <img 
                src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/o2room.jpg.webp?raw=true" 
                alt="妊活・ベビーシューズ"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="font-bold text-sm tracking-widest text-pink-200 mb-1">FERTILITY CARE</p>
                  <h3 className="text-2xl font-serif font-bold">佐世保で始める<br/>酸素妊活</h3>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
              <div className="space-y-8">
                <div>
                  <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-bold mb-3">高圧酸素ルーム</span>
                  <h3 className="text-2xl md:text-3xl font-bold font-serif text-stone-800 mb-4">
                    高圧酸素が「授かる力」を<br/>底上げする理由
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                    高濃度酸素ルーム（酸素カプセル）は、細胞への酸素供給を増やして血流を改善し、
                    卵巣・子宮機能の活性化や冷え性・ストレスの緩和を通じて妊娠しやすい体づくりをサポートします。
                    佐世保市にお住まいで、不妊治療と併用できるケアをお探しの方に選ばれています。
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-pink-50/50 p-5 rounded-xl border border-pink-100">
                    <Thermometer className="text-pink-500 mb-3" size={24} />
                    <h4 className="font-bold text-stone-800 mb-2 text-sm">血流・冷え性改善</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      溶解型酸素が末端まで行き渡り、子宮や卵巣の血流が改善。ポカポカと温かく、受精卵が着床しやすいふかふかのベッド（子宮内膜）を整えます。
                    </p>
                  </div>
                  <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                    <Zap className="text-blue-500 mb-3" size={24} />
                    <h4 className="font-bold text-stone-800 mb-2 text-sm">細胞の活性化</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      酸素は細胞エネルギーの源。卵子や精子の細胞分裂・成熟をサポートします。また、活性酸素を除去しやすくし、卵子の老化防止も期待されます。
                    </p>
                  </div>
                  <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
                    <Heart className="text-green-500 mb-3" size={24} />
                    <h4 className="font-bold text-stone-800 mb-2 text-sm">ホルモン安定</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      リラックス効果により、妊活中の不安やストレスを軽減。自律神経の乱れを整えることで、ホルモン分泌をスムーズにします。
                    </p>
                  </div>
                  <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
                    <Info className="text-orange-500 mb-3" size={24} />
                    <h4 className="font-bold text-stone-800 mb-2 text-sm">継続利用がカギ</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      一度きりではなく、継続的に利用することでホルモンの分泌が活発になるというデータもあり、体質改善には定期的なケアがおすすめです。
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 p-6 rounded-2xl text-xs text-stone-500 space-y-2 border border-stone-200">
                  <p className="font-bold text-stone-700 mb-1 flex items-center gap-2">
                    <Info size={14} />
                    ご利用上の注意
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li>効果には個人差があります。医療的な効果を保証するものではありません。</li>
                    <li>妊娠中、または妊娠の可能性がある場合は、利用前に必ず医師にご相談ください。</li>
                    <li>現在、不妊治療クリニックに通院中の方も併用可能です。</li>
                  </ul>
                </div>

                <div className="text-center pt-2">
                  <p className="text-stone-600 mb-4 text-sm">
                    佐世保市の大塔・早岐・矢峰の各院でご相談いただけます。<br/>
                    まずはトライアル価格でお試しください。
                  </p>
                  <a 
                    href="tel:0956379110"
                    className="inline-flex items-center gap-2 bg-emerald-700 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-emerald-600 transition-all hover:-translate-y-1"
                  >
                    <MapPin size={18} />
                    お近くの院へ電話予約
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};