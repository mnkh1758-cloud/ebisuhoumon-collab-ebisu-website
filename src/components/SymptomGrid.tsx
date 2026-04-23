import React, { useState, useEffect } from 'react';
import { BodyPart, Symptom } from '../types';
import { SYMPTOMS } from '../constants';
import { ArrowRight, X, CheckCircle2, Stethoscope, Info, Phone, RefreshCw, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SymptomGridProps {}

export const SymptomGrid: React.FC<SymptomGridProps> = () => {
  const [selectedPart, setSelectedPart] = useState<BodyPart | 'ALL'>('ALL');
  const [activeSymptom, setActiveSymptom] = useState<Symptom | null>(null);
  const navigate = useNavigate();

  const filteredSymptoms = selectedPart === 'ALL'
    ? SYMPTOMS
    : SYMPTOMS.filter((s) => s.bodyPart === selectedPart);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (activeSymptom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [activeSymptom]);

  const handleSymptomClick = (symptom: Symptom) => {
    // If it's the Traffic Accident symptom (ID: s13), navigate to the dedicated page
    if (symptom.id === 's13') {
      navigate('/traffic-accident');
    } else if (symptom.id === 's12') {
      navigate('/infertility');
    } else if (symptom.id === 's20') {
      navigate('/home-visit');
    } else if (symptom.id === 's9') {
      navigate('/beauty-acupuncture');
    } else if (symptom.id === 's17') {
      navigate('/oxygen-room');
    } else if (symptom.id === 's8') {
      navigate('/autonomic-imbalance');
    } else if (symptom.id === 's4') {
      navigate('/lumbago');
    } else if (symptom.id === 's14' || symptom.id === 's5') {
      navigate('/pelvic-correction');
    } else {
      setActiveSymptom(symptom);
    }
  };

  const renderFormattedDescription = (text?: string, theme?: any) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      // Check if line contains "STEP XX"
      if (line.match(/STEP \d+/)) {
        const parts = line.split(/(STEP \d+)/g);
        return (
          <div key={i} className={`mb-4 leading-relaxed p-4 ${theme?.bgLight || 'bg-stone-50'} rounded-xl border ${theme?.border || 'border-stone-100'}`}>
            {parts.map((part, j) => {
              if (part.match(/STEP \d+/)) {
                return (
                  <span 
                    key={j} 
                    className={`inline-block ${theme?.button?.split(' ')[0] || 'bg-emerald-700'} text-white px-3 py-1 rounded-md text-xs font-bold mr-3 shadow-sm align-middle tracking-wider font-mono`}
                  >
                    {part}
                  </span>
                );
              }
              return <span key={j} className="align-middle text-stone-700 text-sm font-medium">{part}</span>;
            })}
          </div>
        );
      }
      // Check for 【Title】 pattern
      if (line.match(/^【.*】$/)) {
          return (
              <h5 key={i} className={`${theme?.textPrimary || 'text-emerald-900'} font-serif font-bold text-lg mt-8 mb-4 flex items-center gap-3`}>
                  <span className={`w-1 h-6 ${theme?.accent?.replace('bg-', 'bg-') || 'bg-emerald-500'} rounded-full`}></span>
                  {line.replace(/[【】]/g, '')}
              </h5>
          );
      }
      // Check for Checkmark pattern (✔)
      if (line.trim().startsWith('✔')) {
          return (
              <div key={i} className="flex items-start gap-3 mb-2 pl-2">
                  <span className={`mt-1.5 shrink-0 w-4 h-4 flex items-center justify-center rounded-full ${theme?.bgLight || 'bg-emerald-50'} ${theme?.textSecondary || 'text-emerald-600'}`}>
                    <CheckCircle2 size={12} />
                  </span>
                  <span className="text-stone-700 font-bold">{line.replace('✔', '').trim()}</span>
              </div>
          );
      }
      // Check for Bullet pattern (・)
      if (line.trim().startsWith('・')) {
          return (
              <div key={i} className="flex items-start gap-3 mb-2 pl-4">
                  <span className={`mt-2 shrink-0 w-1.5 h-1.5 rounded-full ${theme?.accent || 'bg-emerald-500'}`}></span>
                  <span className="text-stone-700">{line.replace('・', '').trim()}</span>
              </div>
          );
      }

      return <div key={i} className="min-h-[1em] mb-2 text-stone-600 leading-8 text-justify">{line}</div>;
    });
  };

  // Interactive Body Map Component
  const BodyMap = () => {
    // Helper to check if a part is active
    const isActive = (part: BodyPart) => selectedPart === part;
    
    // Common styles
    const pathBaseClass = "cursor-pointer transition-all duration-300 stroke-white stroke-2 hover:filter hover:drop-shadow-lg";
    const getFillClass = (part: BodyPart) => isActive(part) ? "fill-emerald-500" : "fill-stone-300 hover:fill-emerald-300";

    return (
      <div className="relative w-full max-w-[300px] h-[500px] mx-auto select-none">
         <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-xl">
            {/* Defs for gradients/filters */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Other / Full Body Background Click */}
            <rect 
               x="0" y="0" width="200" height="400" 
               className="fill-transparent cursor-pointer" 
               onClick={() => setSelectedPart(BodyPart.OTHER)}
            />

            {/* HEAD & NECK */}
            <g onClick={() => setSelectedPart(BodyPart.HEAD_NECK)}>
              <circle cx="100" cy="40" r="25" className={`${pathBaseClass} ${getFillClass(BodyPart.HEAD_NECK)}`} />
              <path d="M85,60 Q100,75 115,60 L115,75 L85,75 Z" className={`${pathBaseClass} ${getFillClass(BodyPart.HEAD_NECK)}`} />
            </g>

            {/* ARMS (Left & Right) */}
            <g onClick={() => setSelectedPart(BodyPart.ARM_HAND)}>
               {/* Left Arm */}
               <path d="M45,80 L70,80 L70,180 Q57.5,190 45,180 Z" className={`${pathBaseClass} ${getFillClass(BodyPart.ARM_HAND)}`} />
               {/* Right Arm */}
               <path d="M130,80 L155,80 L155,180 Q142.5,190 130,180 Z" className={`${pathBaseClass} ${getFillClass(BodyPart.ARM_HAND)}`} />
            </g>

            {/* SHOULDERS & BACK (Upper Torso) */}
            <g onClick={() => setSelectedPart(BodyPart.SHOULDER_BACK)}>
               <path d="M75,75 L125,75 L130,80 L130,140 L70,140 L70,80 Z" className={`${pathBaseClass} ${getFillClass(BodyPart.SHOULDER_BACK)}`} />
            </g>

            {/* WAIST & HIPS (Lower Torso) */}
            <g onClick={() => setSelectedPart(BodyPart.WAIST_HIP)}>
              <path d="M70,145 L130,145 L130,190 L70,190 Z" className={`${pathBaseClass} ${getFillClass(BodyPart.WAIST_HIP)}`} />
            </g>

            {/* LEGS */}
            <g onClick={() => setSelectedPart(BodyPart.LEG_FOOT)}>
               {/* Left Leg */}
               <path d="M70,195 L95,195 L95,350 L70,350 Z" className={`${pathBaseClass} ${getFillClass(BodyPart.LEG_FOOT)}`} />
               {/* Right Leg */}
               <path d="M105,195 L130,195 L130,350 L105,350 Z" className={`${pathBaseClass} ${getFillClass(BodyPart.LEG_FOOT)}`} />
            </g>

            {/* Labels (visible on hover or active) */}
            <text x="100" y="25" textAnchor="middle" className={`text-[10px] font-bold fill-white pointer-events-none transition-opacity duration-300 ${isActive(BodyPart.HEAD_NECK) ? 'opacity-100' : 'opacity-0'}`}>Head</text>
            <text x="100" y="110" textAnchor="middle" className={`text-[10px] font-bold fill-white pointer-events-none transition-opacity duration-300 ${isActive(BodyPart.SHOULDER_BACK) ? 'opacity-100' : 'opacity-0'}`}>Back</text>
         </svg>

         {/* Selection Indicator */}
         {selectedPart !== 'ALL' && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
           </div>
         )}
      </div>
    );
  };

  return (
    <section id="symptoms" className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Bright Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-50/50 skew-x-12"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-100/40 rounded-full blur-[80px]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <span className="w-8 h-px bg-emerald-400"></span>
            <span className="text-emerald-600 text-xs font-bold tracking-[0.2em] uppercase">Symptom Search</span>
            <span className="w-8 h-px bg-emerald-400"></span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-stone-800 mb-6 font-serif leading-tight">
            どの部分がお辛いですか？
          </h2>
          <p className="text-stone-500 text-base">
            図の気になる部分をタップするか、下記のリストから選択してください。
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Interactive Body Map (Sticky on Desktop) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-32 flex flex-col items-center">
             <div className="relative bg-white rounded-[3rem] p-8 shadow-xl border border-stone-100 w-full max-w-sm mx-auto">
                <div className="absolute top-6 right-6">
                   <button 
                     onClick={() => setSelectedPart('ALL')}
                     className={`p-2 rounded-full transition-all ${selectedPart === 'ALL' ? 'bg-stone-100 text-stone-400 cursor-default' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                     title="選択を解除"
                   >
                     <RefreshCw size={18} />
                   </button>
                </div>
                <div className="text-center mb-4">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Body Map</p>
                  <p className="text-emerald-800 font-bold font-serif text-lg mt-1">
                    {selectedPart === 'ALL' ? '全身' : selectedPart}
                  </p>
                </div>
                <BodyMap />
                <div className="mt-6 text-center">
                   <p className="text-xs text-stone-400">
                     ※ {selectedPart === 'ALL' ? '部位を選択して絞り込み' : `${filteredSymptoms.length}件の症状が見つかりました`}
                   </p>
                </div>
             </div>

             {/* Mobile Filters (Horizontal Scroll) */}
             <div className="lg:hidden w-full overflow-x-auto pb-4 mt-8 flex gap-3 px-1 no-scrollbar">
                <button
                  onClick={() => setSelectedPart('ALL')}
                  className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all border ${
                    selectedPart === 'ALL'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-lg'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  すべて表示
                </button>
                {Object.values(BodyPart).map((part) => (
                  <button
                    key={part}
                    onClick={() => setSelectedPart(part)}
                    className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all border ${
                      selectedPart === part
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {part}
                  </button>
                ))}
             </div>
          </div>

          {/* Right Column: Symptom Grid */}
          <div className="w-full lg:w-2/3">
             <div className="flex justify-between items-end mb-8 border-b border-stone-100 pb-4">
               <h3 className="text-xl font-bold font-serif text-stone-700 flex items-center gap-2">
                 {selectedPart === 'ALL' ? (
                   <>
                     <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                     すべての症状一覧
                   </>
                 ) : (
                    <>
                      <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                      {selectedPart}の悩み
                    </>
                 )}
               </h3>
               <span className="text-sm text-stone-400 font-mono">
                 {filteredSymptoms.length} results
               </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSymptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  onClick={() => handleSymptomClick(symptom)}
                  className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border flex flex-col h-full 
                    ${symptom.id === 's13' 
                      ? 'border-orange-200 hover:border-orange-400 ring-4 ring-orange-50 hover:ring-orange-100' 
                      : 'border-stone-100 hover:border-emerald-200'}`}
                >
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors z-10"></div>
                    <img
                      src={symptom.imageUrl}
                      alt={symptom.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-emerald-900 shadow-sm flex items-center gap-1.5">
                      <symptom.icon size={12} className="text-emerald-600" />
                      {symptom.bodyPart}
                    </div>
                    {symptom.id === 's13' && (
                      <div className="absolute bottom-4 right-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
                        自己負担0円
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold font-serif text-stone-800 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {symptom.title}
                    </h4>
                    <p className="text-stone-500 text-xs leading-relaxed mb-6 line-clamp-3">
                      {symptom.description}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-2 text-emerald-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      詳細を見る
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredSymptoms.length === 0 && (
               <div className="py-20 text-center bg-stone-50 rounded-3xl border border-stone-100">
                  <p className="text-stone-400">該当する症状が見つかりませんでした。</p>
                  <button onClick={() => setSelectedPart('ALL')} className="mt-4 text-emerald-600 font-bold hover:underline">
                    すべて表示する
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Standard Symptom Modal */}
      {activeSymptom && (() => {
        const isInfertility = activeSymptom.id === 's12';
        const isBeauty = activeSymptom.id === 's9';
        
        let theme;
        if (isInfertility) {
            theme = {
                textPrimary: 'text-rose-900',
                textSecondary: 'text-rose-600',
                textTertiary: 'text-rose-400',
                bgLight: 'bg-rose-50',
                bgSurface: 'bg-white',
                border: 'border-rose-100',
                borderStrong: 'border-rose-200',
                accent: 'bg-rose-400',
                button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30',
                iconBg: 'bg-rose-100',
                gradient: 'from-rose-500 to-orange-400'
            };
        } else if (isBeauty) {
            theme = {
                textPrimary: 'text-pink-900',
                textSecondary: 'text-pink-600',
                textTertiary: 'text-pink-400',
                bgLight: 'bg-pink-50',
                bgSurface: 'bg-white',
                border: 'border-pink-100',
                borderStrong: 'border-pink-200',
                accent: 'bg-pink-400',
                button: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30',
                iconBg: 'bg-pink-100',
                gradient: 'from-pink-500 to-purple-400'
            };
        } else {
            theme = {
                textPrimary: 'text-emerald-900',
                textSecondary: 'text-emerald-600',
                textTertiary: 'text-emerald-400',
                bgLight: 'bg-emerald-50',
                bgSurface: 'bg-white',
                border: 'border-emerald-100',
                borderStrong: 'border-emerald-200',
                accent: 'bg-emerald-500',
                button: 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-600/30',
                iconBg: 'bg-emerald-50',
                gradient: 'from-emerald-600 to-teal-500'
            };
        }

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div 
            className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setActiveSymptom(null)}
          ></div>
          
          <div className={`bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-fade-in-up flex flex-col lg:flex-row ring-1 ring-white/20 ${(isInfertility || isBeauty) ? 'font-serif' : ''}`}>
            
            <button 
              onClick={() => setActiveSymptom(null)}
              className={`absolute top-4 right-4 z-50 p-3 bg-white/90 backdrop-blur rounded-full hover:${theme.bgLight} text-stone-500 hover:${theme.textSecondary} transition-colors shadow-sm`}
            >
              <X size={24} />
            </button>

            {/* Modal Image Sidebar */}
            <div className="w-full lg:w-2/5 relative h-48 lg:h-auto shrink-0">
              <img 
                src={activeSymptom.imageUrl} 
                alt={activeSymptom.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-stone-900/20 lg:to-stone-900/90"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 lg:bg-gradient-to-t lg:from-stone-900 lg:to-transparent">
                <div className={`flex items-center gap-2 ${isInfertility ? 'text-rose-200' : isBeauty ? 'text-pink-200' : 'text-emerald-300'} text-xs font-bold tracking-widest uppercase mb-2`}>
                  <activeSymptom.icon size={14} />
                  {activeSymptom.bodyPart}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold font-serif text-white mb-1 shadow-black drop-shadow-md">
                  {activeSymptom.detailedTitle || activeSymptom.title}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
              <div className="p-6 lg:p-10 space-y-8 lg:space-y-10">
                
                {/* Main Symptoms */}
                {activeSymptom.mainSymptomsList && (
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                      <Info size={14} />
                      主な自覚症状
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeSymptom.mainSymptomsList.map((item, idx) => (
                        <span key={idx} className={`${theme.bgLight} ${theme.textSecondary} px-4 py-2 rounded-lg text-xs font-bold border ${theme.border}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment Concept */}
                <div className={`${theme.bgLight} rounded-2xl p-6 border ${theme.border}`}>
                   <div className="flex items-start gap-4 mb-4">
                     <div className={`p-2 bg-white rounded-lg ${theme.textSecondary} shrink-0 shadow-sm border ${theme.border}`}>
                       {isInfertility ? <Sparkles size={20} /> : isBeauty ? <Sparkles size={20} /> : <Stethoscope size={20} />}
                     </div>
                     <div>
                       <span className={`${theme.textSecondary} text-[10px] font-bold tracking-widest uppercase block mb-1`}>Treatment Policy</span>
                       <h4 className={`text-xl font-bold font-serif ${theme.textPrimary}`}>
                         {activeSymptom.treatmentConcept || '当院の治療方針'}
                       </h4>
                     </div>
                   </div>
                   <div className="text-sm text-stone-700">
                     {renderFormattedDescription(activeSymptom.treatmentDescription || activeSymptom.description, theme)}
                   </div>
                </div>

                {/* Satisfaction Data (New Section) */}
                {activeSymptom.satisfactionData && (
                  <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-lg relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>
                    <h4 className={`text-center font-serif font-bold text-xl mb-8 ${theme.textPrimary} flex items-center justify-center gap-2`}>
                      <Heart className={`fill-current ${theme.textSecondary}`} size={24} />
                      高圧酸素ルーム体験
                      <span className="text-2xl border-b-4 border-rose-200">満足度指数</span>
                    </h4>
                    <div className="grid gap-8 md:grid-cols-3">
                      {activeSymptom.satisfactionData.map((item, idx) => (
                        <div key={idx} className="text-center group">
                          <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center">
                             <svg className="w-full h-full transform -rotate-90 drop-shadow-md">
                               <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-100" />
                               <circle 
                                 cx="56" cy="56" r="48" 
                                 stroke="currentColor" 
                                 strokeWidth="8" 
                                 fill="transparent" 
                                 strokeDasharray={301.6} 
                                 strokeDashoffset={301.6 * (1 - item.percentage / 100)} 
                                 strokeLinecap="round"
                                 className={`${theme.textSecondary} transition-all duration-1000 ease-out`} 
                               />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                               <span className={`text-2xl font-bold ${theme.textPrimary}`}>{item.percentage}<span className="text-sm">%</span></span>
                             </div>
                          </div>
                          <h5 className={`font-bold ${theme.textPrimary} mb-2 text-sm`}>{item.title}</h5>
                          <p className="text-xs text-stone-500 leading-tight">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Detail Image if Exists */}
                {activeSymptom.detailImage && (
                  <div className={`rounded-xl overflow-hidden shadow-md border ${theme.border}`}>
                    <img 
                      src={activeSymptom.detailImage} 
                      alt={`${activeSymptom.title}の詳細画像`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Sub Conditions Details */}
                {activeSymptom.subConditions && (
                  <div className="space-y-12">
                    {activeSymptom.subConditions.map((cond, idx) => (
                      <div key={idx} className={`border-t ${theme.border} pt-8 first:border-0 first:pt-0`}>
                        <h5 className={`text-xl font-bold ${theme.textPrimary} mb-4 flex items-center gap-3 font-serif`}>
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full ${theme.textSecondary} ${theme.bgLight} border ${theme.borderStrong} text-sm shrink-0 shadow-sm`}>{idx + 1}</span>
                          {cond.title}
                        </h5>
                        
                        {cond.imageUrl && (
                          <div className={`mb-6 rounded-2xl overflow-hidden shadow-md border ${theme.border} ml-0 md:ml-11`}>
                            <img src={cond.imageUrl} alt={cond.title} className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-700" />
                          </div>
                        )}

                        <p className="text-stone-700 leading-relaxed text-base mb-6 pl-0 md:pl-11 font-medium">
                          {cond.description}
                        </p>
                        
                        {cond.types && (
                          <div className="grid md:grid-cols-2 gap-4 pl-0 md:pl-11">
                            {cond.types.map((type, tIdx) => (
                               <div key={tIdx} className={`bg-white rounded-xl border ${theme.border} overflow-hidden hover:${theme.borderStrong} transition-all shadow-sm hover:shadow-lg flex flex-col h-full group`}>
                                  {type.imageUrl && (
                                    <div className="h-40 w-full overflow-hidden bg-stone-100 relative">
                                      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors z-10"></div>
                                      <img src={type.imageUrl} alt={type.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                    </div>
                                  )}
                                  <div className="p-5 flex-1 flex flex-col">
                                    <span className={`font-bold ${theme.textSecondary} text-sm block mb-2 border-b ${theme.border} pb-2`}>{type.title}</span>
                                    <p className="text-xs text-stone-600 leading-relaxed">{type.description}</p>
                                  </div>
                               </div>
                            ))}
                          </div>
                        )}

                        {cond.cause && (
                          <div className={`${theme.bgLight} p-5 rounded-xl border-l-4 ${theme.borderStrong.replace('border', 'border-l')} ml-0 md:ml-11 mt-6`}>
                            <span className={`text-xs font-bold ${theme.textSecondary} block mb-2 uppercase tracking-wider flex items-center gap-2`}>
                              <Info size={14} />
                              主な原因
                            </span>
                            <p className="text-stone-700 text-sm leading-relaxed">{cond.cause}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended For */}
                {activeSymptom.recommendedFor && (
                  <div className="bg-stone-800 text-stone-300 rounded-2xl p-6 relative overflow-hidden">
                     <div className={`absolute top-0 right-0 p-24 ${isInfertility ? 'bg-rose-500/20' : isBeauty ? 'bg-pink-500/20' : 'bg-emerald-500/10'} rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2`}></div>
                     <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-base relative z-10">
                       <CheckCircle2 size={18} className={isInfertility ? 'text-rose-400' : isBeauty ? 'text-pink-400' : 'text-emerald-400'} />
                       こんな方におすすめ
                     </h4>
                     <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 relative z-10">
                       {activeSymptom.recommendedFor.map((item, idx) => (
                         <li key={idx} className="flex items-start gap-2 text-xs">
                           <span className={`w-1 h-1 rounded-full ${theme.accent} mt-1.5 shrink-0`}></span>
                           <span className="leading-relaxed opacity-90">{item}</span>
                         </li>
                       ))}
                     </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-stone-100 p-4 lg:px-10 flex flex-col sm:flex-row gap-3 justify-between items-center z-20">
                 <p className="text-xs text-stone-400 hidden sm:block font-bold">まずはお気軽にご相談ください</p>
                 <div className="flex gap-3 w-full sm:w-auto">
                   <button onClick={() => setActiveSymptom(null)} className="flex-1 sm:flex-none py-2.5 px-6 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors font-bold text-xs">
                     閉じる
                   </button>
                   <a href="tel:0956-37-9110" className={`flex-1 sm:flex-none ${theme.button} text-white py-2.5 px-6 rounded-full font-bold shadow-md transition-all text-center text-xs flex items-center justify-center gap-2`}>
                     <Phone size={14} />
                     電話で予約
                   </a>
                 </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </section>
  );
};