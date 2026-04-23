import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <img 
                src="https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/ebisulogo-new.webp?raw=true" 
                alt="えびす鍼灸整骨院ロゴ" 
                className="w-16 h-16 object-contain bg-white rounded-full p-0.5" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-widest leading-none">えびす鍼灸整骨院</span>
                <span className="text-xs tracking-wider opacity-60">佐世保市 3店舗展開</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              心と体の調和を目指して。<br/>
              あなたの「治したい」に寄り添う、<br/>
              生涯のパートナーでありたい。
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Menu</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">ホーム</a></li>
              <li><a href="#services" className="hover:text-emerald-500 transition-colors">施術メニュー</a></li>
              <li><a href="#symptoms" className="hover:text-emerald-500 transition-colors">お悩み別検索</a></li>
              <li><a href="#access" className="hover:text-emerald-500 transition-colors">アクセス・店舗情報</a></li>
            </ul>
          </div>

           {/* Simple Info */}
           <div>
            <h4 className="text-white font-bold mb-6">Info</h4>
            <ul className="space-y-4 text-sm">
              <li>平日: 9:00 - 13:00 / 15:00 - 20:00</li>
              <li>土曜: 9:00 - 14:00</li>
              <li className="text-stone-500">※店舗により異なる場合がございます</li>
              <li>定休日: 日曜日・祝日</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Ebisu Acupuncture and Osteopathic Seikotuin. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-white transition-colors">サイトマップ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};