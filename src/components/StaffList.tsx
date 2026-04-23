import React, { useEffect } from 'react';
import { ArrowLeft, Award, Heart, Clock, Smile } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface StaffMember {
  id: string;
  name: string;
  englishName: string;
  role: string;
  englishRole: string;
  qualification: string;
  clinicId: string; // 'haiki', 'daito', 'yamine', or 'all'
  clinicName: string;
  image: string;
  philosophyTitle: string;
  philosophy: string;
  experience: string;
  specialty: string;
  hobbies: string[];
  message: string;
  tel: string;
}

const staffMembers: StaffMember[] = [
  {
    id: 'hirase',
    name: '平瀬 俊輔',
    englishName: 'Shunsuke Hirase',
    role: '総院長',
    englishRole: 'General Director',
    qualification: '柔道整復師・鍼灸師',
    clinicId: 'haiki',
    clinicName: 'えびす鍼灸整骨院',
    image: 'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/hirase-new.jpg.webp?raw=true', 
    philosophyTitle: '根本からの改善を',
    philosophy: 'これまで数多くの症状と向き合い、真摯に施術してきました。\n痛みのある部分だけでなく、姿勢や骨格、筋肉のバランスを総合的に評価し、痛みの根本となる原因から改善する施術を大切にしています。\n私生活では、5人の子どもの父として毎日奮闘中です。\nどんなお悩みでもお気軽にご相談ください。',
    experience: '10年',
    specialty: '骨盤矯正・腰痛・膝痛',
    hobbies: ['お酒'],
    message: '皆様の健康な生活をサポートできるよう、全力で施術させていただきます。お身体のことでお悩みでしたら、ぜひ一度ご相談ください。', // ここに写真の下に表示したい文章を記述します
    tel: '0956379110'
  },
  {
    id: 'kawahara',
    name: '川原 快斗',
    englishName: 'Kaito Kawahara',
    role: '院長',
    englishRole: 'Seikotuin Director',
    qualification: '柔道整復師',
    clinicId: 'haiki',
    clinicName: 'えびす鍼灸整骨院 早岐院',
    image: 'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/kawahara.jpg.webp?raw=true',
    philosophyTitle: '痛みのある方にベストの施術を',
    philosophy: '皆様の目的に対して、親身に対応しあらゆる手法の中からベストの施術を行い、皆様の健康へのサポートができるような施術を心がけていきます。',
    experience: '8年',
    specialty: '骨盤矯正',
    hobbies: ['ソフトボール', '野球', 'ゴルフ'],
    message: '早岐院にて、皆様のご来院を心よりお待ちしております。\nお身体の不調や痛みについて、どんな些細なことでもお気軽にご相談ください。',
    tel: '0956563390'
  },
  {
    id: 'yamaguchi',
    name: '山口 隼人',
    englishName: 'Hayato Yamaguchi',
    role: '院長',
    englishRole: 'Seikotuin Director',
    qualification: '柔道整復師',
    clinicId: 'daitou',
    clinicName: 'えびす鍼灸整骨院 大塔院',
    image: 'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/yamagutihayato.webp?raw=true',
    philosophyTitle: '肩甲骨はがしとマッサージ得意です！',
    philosophy: '一人一人に合わせた施術で体と心と元気にするお手伝いをさせて頂きます。',
    experience: '9年',
    specialty: 'マッサージ　肩甲骨はがし',
    hobbies: ['バレーボール', '旅行'],
    message: '大塔院にて、皆様のご来院を心よりお待ちしております。\nお身体の不調や痛みについて、どんな些細なことでもお気軽にご相談ください。',
    tel: '0956379110'
  },
  {
    id: 'nagaoka',
    name: '長岡 弘大',
    englishName: 'Kodai Nagaoka',
    role: '施術スタッフ',
    englishRole: 'Therapist',
    qualification: '柔道整復師',
    clinicId: 'daitou',
    clinicName: 'えびす鍼灸整骨院 大塔院',
    image: 'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/nagaoka.webp?raw=true',
    philosophyTitle: 'マッサージとソフト矯正が得意です！',
    philosophy: '身体を動かすことが好きです！！最近ではランニングとソフトバレーをしています(＾＾)なのでケガはもちろん、ストレッチ・トレーニングの事で教えて欲しい方は気軽にご相談ください！！',
    experience: '8年',
    specialty: '骨盤矯正・姿勢矯正・ストレッチ',
    hobbies: ['ランニング', 'NETFLIX鑑賞'],
    message: '皆様の健康をサポートできるよう、精一杯施術させていただきます。お気軽にご相談ください！',
    tel: '0956379110'
  },
  {
    id: 'utiumi',
    name: '内海 典子',
    englishName: 'Noriko Utiumi',
    role: '施術スタッフ',
    englishRole: 'Therapist',
    qualification: '鍼灸師',
    clinicId: 'daitou',
    clinicName: 'えびす鍼灸整骨院 大塔院',
    image: 'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/utiumi.jpg.webp?raw=true',
    philosophyTitle: '肩甲骨はがしとマッサージ得意です！',
    philosophy: '一人一人に合わせた施術で体と心と元気にするお手伝いをさせて頂きます。',
    experience: '9年',
    specialty: '美容鍼　マッサージ',
    hobbies: ['バレーボール', '旅行'],
    message: '大塔院にて、皆様のご来院を心よりお待ちしております。\nお身体の不調や痛みについて、どんな些細なことでもお気軽にご相談ください。',
    tel: '0956379110'
  },
  {
    id: 'hokao',
    name: '外尾 光平',
    englishName: 'Kohei Hokao',
    role: '院長',
    englishRole: 'Seikotuin Director',
    qualification: '柔道整復師・鍼灸師',
    clinicId: 'yamine',
    clinicName: 'えびす鍼灸整骨院 矢峰院',
    image: 'https://github.com/ebisuhoumon-collab/ebisuhoumon-collab-ebisu-website/blob/main/hokao.webp?raw=true',
    philosophyTitle: '真摯に向き合い、根本から改善します',
    philosophy: 'これまで数多くの症状と向き合い、真摯に施術してきました。\n痛みのある部分だけでなく、姿勢や骨格、筋肉のバランスを総合的に評価し、痛みの根本となる原因から改善する施術を大切にしています。\nどんなお悩みでもお気軽にご相談ください。',
    experience: '10年',
    specialty: '骨盤矯正',
    hobbies: ['お酒'],
    message: '矢峰院にて、皆様のご来院を心よりお待ちしております。\nお身体の不調や痛みについて、どんな些細なことでもお気軽にご相談ください。',
    tel: '0956563921'
  }
];

export const StaffList: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Settings
    let clinicName = "各院";
    if (clinicId === 'daitou') clinicName = "大塔院";
    if (clinicId === 'haiki') clinicName = "早岐院";
    if (clinicId === 'yamine') clinicName = "矢峰院";

    document.title = `スタッフ紹介（${clinicName}） | えびす鍼灸整骨院`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", `えびす鍼灸整骨院 ${clinicName}のスタッフをご紹介します。国家資格を持つ経験豊富なスタッフが、皆様の健康をサポートいたします。`);
    }
  }, [clinicId]);

  const filteredStaff = staffMembers.filter(staff => 
    staff.clinicId === 'all' || staff.clinicId === clinicId
  );

  const getClinicName = (id: string | undefined) => {
    switch(id) {
      case 'haiki': return '早岐院';
      case 'daitou': return '大塔院';
      case 'yamine': return '矢峰院';
      default: return '全院';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pt-24 pb-20">
      <div className="container mx-auto px-6">
        {/* Breadcrumb / Back */}
        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-stone-500">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            トップページ
          </Link>
          <span>/</span>
          <Link to="/staff" className="hover:text-emerald-600 transition-colors">
            スタッフ紹介
          </Link>
          <span>/</span>
          <span className="text-stone-800">{getClinicName(clinicId)}</span>
        </div>

        {/* Page Title */}
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-bold text-xs tracking-[0.3em] uppercase block mb-3">Staff Introduction</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
            {getClinicName(clinicId)} スタッフ紹介
          </h1>
          <div className="w-12 h-1 bg-emerald-400 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="space-y-16">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((staff) => (
              <div key={staff.id} className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-stone-100">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Image Section */}
                  <div className="md:w-2/5 relative min-h-[300px] md:min-h-full bg-stone-200">
                    <img 
                      src={staff.image} 
                      alt={`${staff.name} ${staff.role}`} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent md:hidden"></div>
                    <div className="absolute bottom-6 left-6 text-white md:hidden">
                      <p className="text-xs font-bold tracking-widest opacity-90 mb-1">{staff.clinicName}</p>
                      <p className="text-xl font-serif font-bold">{staff.name}</p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="md:w-3/5 p-6 md:p-8 lg:p-10">
                    <div className="hidden md:block mb-6">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">{staff.role}</span>
                         <span className="text-stone-400 text-[10px] font-bold tracking-widest uppercase">{staff.englishRole}</span>
                      </div>
                      <p className="text-emerald-600 font-bold text-xs mb-1">{staff.qualification}</p>
                      <h2 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 mb-1">{staff.name}</h2>
                      <p className="text-stone-400 font-serif italic text-sm">{staff.englishName}</p>
                    </div>

                    <div className="space-y-6">
                      {/* Philosophy */}
                      <div>
                        <h3 className="flex items-center gap-2 text-emerald-700 font-bold mb-2 text-base">
                          <Heart size={16} className="fill-emerald-100" />
                          施術で心がけていること
                        </h3>
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                          {staff.philosophyTitle && <p className="font-bold text-stone-800 mb-2 text-sm">{staff.philosophyTitle}</p>}
                          <p className="text-stone-600 leading-relaxed text-xs md:text-sm whitespace-pre-wrap">
                            {staff.philosophy}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                            <Clock size={12} /> 施術歴
                          </span>
                          <p className="text-lg font-bold text-stone-800 font-serif">{staff.experience}</p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                            <Award size={12} /> 得意な技術・デザイン
                          </span>
                          <p className="text-sm font-bold text-stone-800">{staff.specialty}</p>
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <span className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                            <Smile size={12} /> 趣味・マイブーム
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {staff.hobbies.map((hobby) => (
                              <span key={hobby} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message / CTA */}
                    <div className="mt-8 pt-6 border-t border-stone-100">
                      <p className="text-stone-600 text-xs leading-relaxed mb-4 whitespace-pre-wrap">
                        {staff.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-200">
              <p className="text-stone-500 font-bold text-lg">現在、スタッフ情報の準備中です。</p>
              <Link to="/staff" className="text-emerald-600 font-bold mt-4 inline-block hover:underline">
                店舗選択に戻る
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
