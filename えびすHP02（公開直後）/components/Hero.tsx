import React, { useState, useEffect } from 'react';
import { ChevronDown, Star, ShieldCheck } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1544367563-121910aa662f?q=80&w=1920&auto=format&fit=crop",
    alt: "Healthy Lifestyle and Wellness"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1920&auto=format&fit=crop",
    alt: "Acupuncture and Osteopathy Treatment"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1920&auto=format&fit=crop",
    alt: "Rehabilitation and Training"
  }
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className={`w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-linear ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>
        ))}

        {/* Sophisticated Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent z-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-12">
          
          {/* Left Side: Text Content */}
          <div className="max-w-3xl space-y-8 animate-fade-in-up lg:w-1/2">
            <div className="flex items-center gap-4 mb-4">
               <div className="h-px w-12 bg-emerald-400/80"></div>
               <h2 className="text-emerald-100 font-bold tracking-[0.3em] uppercase text-xs md:text-sm drop-shadow-md">
                 佐世保市の根本治療エキスパート
               </h2>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-wide font-serif">
              <span className="block mb-2 text-white drop-shadow-lg">その痛み、</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-emerald-100 drop-shadow-sm">
                根本から整える。
              </span>
            </h1>

            <p className="text-base md:text-lg text-stone-100 leading-loose font-light tracking-wide border-l-2 border-emerald-500/50 pl-6 backdrop-blur-sm bg-stone-900/20 py-4 rounded-r-lg">
              佐世保市のえびす鍼灸整骨院は、<strong>交通事故・むち打ち</strong>の専門治療をはじめ、
              <strong>ぎっくり腰</strong>や<strong>四十肩</strong>、<strong>骨折</strong>後のリハビリに特化した根本治療の専門院。<br />
              <strong>酸素ルーム</strong>を完備し、<strong>不妊治療</strong>や<strong>不眠症</strong>のケアまで、あなたの「治したい」に誠実に向き合います。
            </p>
            
            <div className="pt-6 flex flex-col sm:flex-row gap-5">
              <a
                href="#symptoms"
                onClick={(e) => scrollToSection(e, 'symptoms')}
                className="group relative px-8 py-4 overflow-hidden rounded-full bg-emerald-700 text-white shadow-lg transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 hover:-translate-y-1"
              >
                <span className="relative z-10 font-bold tracking-wide flex items-center justify-center gap-2">
                  症状から探す
                  <ChevronDown className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" size={18} />
                </span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-emerald-600"></div>
              </a>
              
              <a
                href="#about"
                onClick={(e) => scrollToSection(e, 'about')}
                className="group px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold rounded-full transition-all text-center hover:border-white/50 shadow-lg"
              >
                <span className="tracking-wide">当院のこだわり</span>
              </a>
            </div>
          </div>

          {/* Right Side: Floating Image Card */}
          <div className="hidden lg:block lg:w-1/2 relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
             <div className="relative z-10 w-80 h-96 ml-auto bg-stone-200 rounded-[2rem] overflow-hidden shadow-2xl rotate-3 border-4 border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" 
                  alt="Smile of relief" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <p className="font-bold text-lg">笑顔を取り戻す</p>
                  <p className="text-xs opacity-80">Pain Relief & Wellness</p>
                </div>
             </div>
             
             {/* Decorative Badge */}
             <div className="absolute -bottom-6 right-64 z-20 bg-white text-emerald-900 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <ShieldCheck size={24} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Trusted</p>
                  <p className="font-bold text-sm">国家資格保持者が施術</p>
                </div>
             </div>

              {/* Decorative Blur */}
             <div className="absolute top-1/2 right-10 w-64 h-64 bg-emerald-500/30 rounded-full blur-[80px] -z-10"></div>
          </div>

        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 right-6 md:right-10 z-20 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentSlide === index ? 'bg-emerald-400 w-8' : 'bg-white/40 hover:bg-white/80 w-4'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={(e) => scrollToSection(e, 'about')}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 animate-bounce-slow z-20 cursor-pointer bg-transparent border-none"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-light shadow-black drop-shadow-sm">Scroll Down</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
      </button>
    </section>
  );
};
