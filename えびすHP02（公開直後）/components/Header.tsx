import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, ChevronDown, CalendarClock, Briefcase, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setIsContactOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll to section after navigation
  useEffect(() => {
    if (location.state && location.state.targetId) {
      const targetId = location.state.targetId;
      // Small timeout to allow rendering
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
      // Clear state to prevent scrolling on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (href === '/staff') {
      navigate('/staff');
      window.scrollTo(0, 0);
      return;
    }

    if (href === '#') {
      if (location.pathname !== '/') {
        navigate('/');
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const targetId = href.replace('#', '');
    
    if (targetId === 'recruit-details') {
       // Special handling if needed, or just treat as section
    }

    if (location.pathname !== '/') {
      navigate('/', { state: { targetId } });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const navLinks = [
    { name: 'ホーム', href: '#' },
    { name: '施術メニュー', href: '#services' },
    { name: '当院について', href: '#about' },
    { name: 'スタッフ紹介', href: '/staff' },
    { name: 'アクセス', href: '#access' },
    { name: '採用情報', href: '#recruit' },
  ];

  const clinics = [
    { name: '大塔院', tel: '0956-37-9110' },
    { name: '早岐院', tel: '0956-56-3390' },
    { name: '矢峰院', tel: '0956-56-3921' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out ${
        isScrolled ? 'glass-nav py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, '#')}
          className="flex items-center gap-3 group relative z-50"
        >
          <div className="relative transition-transform duration-300 group-hover:scale-105">
            <div className={`absolute inset-0 rounded-full bg-white blur-md opacity-30 transition-opacity ${isScrolled ? 'opacity-0' : 'opacity-30'}`}></div>
            <img 
              src="/logo.png" 
              alt="えびす鍼灸整骨院ロゴ" 
              className="w-12 h-12 md:w-16 md:h-16 object-contain bg-white rounded-full shadow-md relative z-10 p-0.5"
            />
          </div>
          <div className={`flex flex-col transition-colors duration-300 ${isScrolled ? 'text-stone-800' : 'text-stone-800 lg:text-white'}`}>
            <span className="font-serif font-bold text-lg md:text-xl tracking-widest leading-none mb-1">えびす鍼灸整骨院</span>
            <span className="text-[10px] md:text-xs tracking-widest opacity-80 uppercase">Ebisu Acupuncture & Osteopathy</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-sm font-medium tracking-wide transition-all duration-300 relative group py-2 ${
                    isScrolled ? 'text-stone-600 hover:text-emerald-700' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-full h-px bg-current transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left ${
                    isScrolled ? 'bg-emerald-600' : 'bg-white'
                  }`}></span>
                </a>
              </li>
            ))}
          </ul>
          
          <div className="relative" ref={contactRef}>
            <button
              onClick={() => setIsContactOpen(!isContactOpen)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg ${
                isScrolled
                  ? 'bg-emerald-800 text-white hover:bg-emerald-900 hover:shadow-emerald-900/20'
                  : 'bg-white text-emerald-900 hover:bg-stone-50'
              }`}
            >
              <CalendarClock size={16} />
              <span>ご予約・相談</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isContactOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div 
              className={`absolute right-0 top-full mt-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden py-3 border border-stone-100 transition-all duration-300 origin-top-right ${
                isContactOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'
              }`}
            >
              <div className="px-6 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 mb-2 bg-stone-50/50 flex items-center gap-2">
                <Phone size={12} />
                各院へ電話予約
              </div>
              {clinics.map((clinic) => (
                <a
                  key={clinic.name}
                  href={`tel:${clinic.tel.replace(/-/g, '')}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-emerald-50 transition-colors group/item"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-100"></span>
                    <span className="font-bold text-stone-700 font-serif group-hover/item:text-emerald-800">{clinic.name}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 font-mono tracking-wide group-hover/item:translate-x-1 transition-transform">
                     {clinic.tel}
                  </span>
                </a>
              ))}
              <div className="px-4 pt-2 mt-2 border-t border-stone-100">
                <a 
                   href="#recruit-details" 
                   onClick={(e) => {
                     setIsContactOpen(false);
                     // Let default behavior happen to trigger hash change in Recruit.tsx
                   }}
                   className="flex items-center justify-center gap-2 w-full bg-stone-100 hover:bg-emerald-600 text-stone-600 hover:text-white py-3 rounded-xl transition-all text-xs font-bold group"
                >
                  <Briefcase size={14} />
                  採用情報・募集要項はこちら
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden relative z-50 p-2 ${isScrolled || isMobileMenuOpen ? 'text-stone-800' : 'text-white'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 bg-stone-50 z-40 transition-transform duration-500 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-24 px-6 pb-10 overflow-y-auto">
            <ul className="space-y-6 mb-10">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-2xl font-serif font-bold text-stone-800 block"
                    onClick={(e) => handleNavClick(e, link.href)}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-4">
               <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">ご予約・お問い合わせ</p>
               {clinics.map((clinic) => (
                  <a
                    key={clinic.name}
                    href={`tel:${clinic.tel.replace(/-/g, '')}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-stone-100"
                  >
                    <span className="font-bold text-stone-700">{clinic.name}</span>
                    <span className="font-bold text-emerald-600">{clinic.tel}</span>
                  </a>
               ))}
               <a 
                  href="#access"
                  onClick={(e) => handleNavClick(e, '#access')}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-800 text-white py-4 rounded-xl font-bold mt-4"
               >
                 <MapPin size={18} />
                 アクセス・店舗情報
               </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};