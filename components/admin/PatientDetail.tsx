import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, doc, Timestamp, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Patient, Reservation, MedicalRecord, RecordImage, ImageGroup } from '../../types';
import { ArrowLeft, Save, Calendar, FileText, AlertTriangle, TrendingUp, Plus, Printer, User, Activity, MessageSquare, ChevronDown, ChevronUp, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MedicalRecordForm } from './MedicalRecordForm';
import { MedicalRecordGallery } from '../../src/components/MedicalRecordGallery';
import { safeUpdateDoc } from '../../lib/safeFirestore';

export const PatientDetail: React.FC = () => {
  const { clinicId, patientId } = useParams<{ clinicId: string; patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Patient>>({});
  
  // Expanded records state
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (!clinicId || !patientId) return;

    const fetchPatient = async () => {
      try {
        const q = query(collection(db, `clinics/${clinicId}/patients`), where('patientId', '==', parseInt(patientId)));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const p = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Patient;
          setPatient(p);
          setEditData(p);
        } else {
          setPatient(null);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `clinics/${clinicId}/patients`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [clinicId, patientId]);

  useEffect(() => {
    if (!clinicId || !patientId) return;
    const resRef = collection(db, `clinics/${clinicId}/reservations`);
    const q = query(resRef, where('patientId', '==', parseInt(patientId)));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      // Sort by date descending
      data.sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());
      setReservations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/reservations`);
    });
    return () => unsub();
  }, [clinicId, patientId]);

  const [recordLimit, setRecordLimit] = useState(10);
  const [hasMoreRecords, setHasMoreRecords] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clinicId || !patient) return;
    const recordsRef = collection(db, `clinics/${clinicId}/medicalRecords`);
    const q = query(
      recordsRef, 
      where('patientDocId', '==', patient.id),
      orderBy('date', 'desc'), 
      limit(recordLimit)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord));
      setRecords(data);
      setHasMoreRecords(snapshot.docs.length === recordLimit);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/medicalRecords`);
    });
    return () => unsub();
  }, [clinicId, patient, recordLimit]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRecords) {
          setRecordLimit(prev => prev + 10);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMoreRecords]);

  const handleSave = async () => {
    if (!clinicId || !patient) return;
    try {
      await safeUpdateDoc(
        clinicId,
        `clinics/${clinicId}/patients`,
        patient.id,
        {
          ...editData,
          updatedAt: Timestamp.now()
        }
      );
      setPatient(editData as Patient);
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}/patients/${patient.id}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-stone-500">読み込み中...</div>;
  }

  if (!patient) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-6">
          <ArrowLeft size={20} /> 戻る
        </button>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-2">患者が見つかりません</h2>
          <p className="text-stone-500">患者番号: {patientId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto print:overflow-visible print:bg-white print:text-black">
      {/* Screen Layout */}
      <div className="flex flex-col gap-6 p-4 md:p-8 print:hidden lg:h-full">
        <div className="flex items-center justify-between shrink-0">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-800">
            <ArrowLeft size={20} /> 戻る
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-xl font-bold hover:bg-stone-200 transition-colors"
            >
              <Printer size={18} /> 印刷
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-stone-100 text-stone-700 px-4 py-2 rounded-xl font-bold hover:bg-stone-200 transition-colors"
              >
                編集する
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditing(false); setEditData(patient); }}
                  className="bg-stone-100 text-stone-700 px-4 py-2 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Save size={18} /> 保存
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Column: Basic Info & Past Records */}
          <div className="flex flex-col gap-6 lg:h-full lg:overflow-hidden">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                  {patient.patientId}
                </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-xl font-bold text-stone-800 border-b border-stone-300 focus:border-emerald-500 outline-none w-full"
                    placeholder="患者名"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-stone-800">{patient.name}</h1>
                )}
                <div className="text-sm text-stone-500">患者番号</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div>
                <div className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1"><User size={14}/> 年齢</div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.age || ''}
                    onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) })}
                    className="w-full border-b border-stone-300 focus:border-emerald-500 outline-none"
                    placeholder="年齢"
                  />
                ) : (
                  <div className="text-stone-800 font-bold">{patient.age ? `${patient.age}歳` : '未設定'}</div>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1"><User size={14}/> 性別</div>
                {isEditing ? (
                  <select
                    value={editData.gender || 'unanswered'}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value as any })}
                    className="w-full border-b border-stone-300 focus:border-emerald-500 outline-none bg-transparent"
                  >
                    <option value="unanswered">未回答</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                  </select>
                ) : (
                  <div className="text-stone-800 font-bold">
                    {patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : patient.gender === 'other' ? 'その他' : '未設定'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1"><Calendar size={14}/> 最終来院日</div>
                <div className="text-stone-800 font-bold">
                  {patient.lastVisit ? new Date(patient.lastVisit.toDate()).toLocaleDateString('ja-JP') : '初診'}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1"><Activity size={14}/> 来院回数</div>
                <div className="text-stone-800 font-bold">
                  {reservations.filter(r => r.status === 'confirmed').length}回
                </div>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-xl border-l-4 ${patient.contraindications ? 'bg-red-50 border-red-500' : 'bg-stone-50 border-stone-300'} print:shadow-none print:border-l-2 print:rounded-none`}>
              <div className={`flex items-center gap-2 mb-2 font-bold ${patient.contraindications ? 'text-red-700' : 'text-stone-600'}`}>
                <AlertTriangle size={16} /> 禁忌情報・要注意事項
              </div>
              {isEditing ? (
                <textarea
                  value={editData.contraindications || ''}
                  onChange={(e) => setEditData({ ...editData, contraindications: e.target.value })}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px] bg-white"
                  placeholder="アレルギー、ペースメーカー、妊娠中など"
                />
              ) : (
                <p className={`whitespace-pre-wrap font-medium ${patient.contraindications ? 'text-red-800' : 'text-stone-500'}`}>
                  {patient.contraindications || '特になし'}
                </p>
              )}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 print:shadow-none print:border-none print:p-0">
              <div className="flex items-center gap-2 mb-2 font-bold text-stone-600">
                <FileText size={16} /> 基本メモ
              </div>
              {isEditing ? (
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] bg-white"
                  placeholder="患者に関する基本情報や特徴など"
                />
              ) : (
                <p className="whitespace-pre-wrap font-medium text-stone-600">
                  {patient.notes || '特になし'}
                </p>
              )}
            </div>
          </div>

          {/* Past Records List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex-1 flex flex-col min-h-[500px] lg:min-h-0 print:shadow-none print:border-none print:p-0">
            <div className="flex items-center justify-between mb-6 print:mb-4 shrink-0">
              <div className="flex items-center gap-2 font-bold text-stone-800 text-lg">
                <FileText size={20} className="text-emerald-600" /> 過去カルテ一覧
              </div>
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-colors text-sm"
              >
                <ImageIcon size={18} /> 画像ギャラリー
              </button>
            </div>

            {records.length > 0 ? (
              <div className="overflow-y-auto flex-1 space-y-4 pr-2 custom-scrollbar print:overflow-visible">
                {records.map(record => {
                  const isExpanded = expandedRecordId === record.id;
                  return (
                    <div key={record.id} className="border border-stone-200 rounded-2xl p-5 bg-stone-50 print:bg-white print:border-b print:rounded-none print:p-0 print:mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-lg text-stone-800">{record.date}</div>
                        <div className="text-sm font-bold text-stone-500 flex items-center gap-1">
                          <User size={14} /> {record.staffName || '担当者未設定'}
                        </div>
                      </div>
                      
                      {record.categories && record.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {record.categories.map(cat => (
                            <span key={cat} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md text-xs font-bold border border-stone-200">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-4 mb-3">
                        <div>
                          <div className="text-xs font-bold text-stone-500 mb-1">主訴</div>
                          <div className="text-sm font-bold text-stone-800">{record.chiefComplaint || '未入力'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-500 mb-1">施術メニュー</div>
                          <div className="inline-block bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-xs font-bold text-emerald-800">
                            {record.menu || '未選択'}
                          </div>
                        </div>
                      </div>

                      {record.images && record.images.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar">
                          {record.images.map((img, i) => (
                            <img 
                              key={i} 
                              src={img.url} 
                              alt={`サムネイル ${i + 1}`} 
                              className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity print:w-24 print:h-24" 
                              onClick={() => setSelectedImage(img.url)}
                            />
                          ))}
                        </div>
                      )}

                      {record.imageGroups && record.imageGroups.length > 0 && (
                        <div className="space-y-3 mb-3">
                          {record.imageGroups.map((group, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-stone-100">
                              <div className="text-xs font-bold text-stone-500 mb-2">{group.label}</div>
                              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {group.images.map((img, j) => (
                                  <img 
                                    key={j} 
                                    src={img.url} 
                                    alt={`${group.label} ${j + 1}`} 
                                    className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity print:w-24 print:h-24" 
                                    onClick={() => setSelectedImage(img.url)}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                        className="w-full py-2 flex items-center justify-center gap-1 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors print:hidden"
                      >
                        {isExpanded ? <><ChevronUp size={16} /> 閉じる</> : <><ChevronDown size={16} /> 詳細を見る</>}
                      </button>

                      <div className={`${isExpanded ? 'block' : 'hidden'} print:block mt-4 pt-4 border-t border-stone-200 space-y-4 animate-in fade-in slide-in-from-top-2`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-bold text-emerald-600 mb-1">S (Subjective: 主観的情報)</div>
                            <p className="text-sm text-stone-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-200 print:border-none print:p-0">{record.s || '未入力'}</p>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-600 mb-1">O (Objective: 客観的情報)</div>
                            <p className="text-sm text-stone-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-200 print:border-none print:p-0">{record.o || '未入力'}</p>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-600 mb-1">A (Assessment: 評価)</div>
                            <p className="text-sm text-stone-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-200 print:border-none print:p-0">{record.a || '未入力'}</p>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-600 mb-1">P (Plan: 計画)</div>
                            <p className="text-sm text-stone-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-200 print:border-none print:p-0">{record.p || '未入力'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {hasMoreRecords && (
                  <div ref={observerTarget} className="h-10 flex items-center justify-center text-stone-400 text-sm">
                    読み込み中...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 border-dashed print:hidden">
                <FileText size={48} className="mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 font-bold">カルテ記録がありません</p>
                <p className="text-sm text-stone-400 mt-1">右側のフォームから今日の記録を追加してください</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: New Record Form */}
        <div className="lg:col-span-1 print:hidden lg:h-full lg:overflow-hidden">
          {clinicId && patient && (
            <MedicalRecordForm
              clinicId={clinicId}
              patient={patient}
              onSaved={() => {
                // Optionally scroll to top of records or show a toast
              }}
            />
          )}
        </div>
      </div>
      </div>

      {/* Print Layout */}
      <div className="hidden print:block print-mincho w-full bg-white text-black" style={{ padding: '10mm', boxSizing: 'border-box' }}>
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-mincho { font-family: "Noto Serif JP", "Yu Mincho", "MS Mincho", serif; }
          `}
        </style>
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold">カルテ記録</h1>
            <div className="text-sm mt-2">印刷日: {new Date().toLocaleDateString('ja-JP')}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">患者番号: {patient.patientId}</div>
            <div className="text-md mt-1">〇〇整骨院</div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-300 mb-2">患者基本情報</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div><span className="text-gray-500 text-sm">氏名</span><br/><span className="font-bold text-lg">{patient.name}</span></div>
            <div><span className="text-gray-500 text-sm">年齢</span><br/><span className="font-bold">{patient.age ? `${patient.age}歳` : '未設定'}</span></div>
            <div><span className="text-gray-500 text-sm">性別</span><br/><span className="font-bold">{patient.gender === 'male' ? '男性' : patient.gender === 'female' ? '女性' : patient.gender === 'other' ? 'その他' : '未設定'}</span></div>
            <div><span className="text-gray-500 text-sm">最終来院日</span><br/><span className="font-bold">{patient.lastVisit ? new Date(patient.lastVisit.toDate()).toLocaleDateString('ja-JP') : '初診'}</span></div>
          </div>
          
          {patient.contraindications && (
            <div className="border-2 border-red-500 p-3 mb-4">
              <div className="text-red-600 font-bold text-sm mb-1">禁忌情報・要注意事項</div>
              <div className="whitespace-pre-wrap">{patient.contraindications}</div>
            </div>
          )}
        </div>

        {/* Latest Record (Today's) */}
        {records.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold border-b border-gray-300 mb-2">今日の施術記録</h2>
            <div className="mb-2 flex justify-between">
              <span className="font-bold">{records[0].date}</span>
              <span>担当: {records[0].staffName || '未設定'}</span>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-500 font-bold">主訴</div>
              <div className="whitespace-pre-wrap leading-relaxed">{records[0].chiefComplaint || '未入力'}</div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-500 font-bold">施術メニュー</div>
              <div className="whitespace-pre-wrap leading-relaxed">{records[0].menu || '未選択'}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-500 font-bold">S (主観的情報)</div>
                <div className="whitespace-pre-wrap leading-relaxed">{records[0].s || '未入力'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold">O (客観的情報)</div>
                <div className="whitespace-pre-wrap leading-relaxed">{records[0].o || '未入力'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold">A (評価)</div>
                <div className="whitespace-pre-wrap leading-relaxed">{records[0].a || '未入力'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-bold">P (計画)</div>
                <div className="whitespace-pre-wrap leading-relaxed">{records[0].p || '未入力'}</div>
              </div>
            </div>
            
            {records[0].images && records[0].images.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-500 font-bold mb-1">添付画像</div>
                <div className="grid grid-cols-2 gap-2">
                  {records[0].images.map((img, i) => (
                    <img key={i} src={img.url} className="w-full h-auto object-contain border border-gray-300" style={{ maxHeight: '200px' }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Past Records (up to 3) */}
        {records.length > 1 && (
          <div>
            <h2 className="text-lg font-bold border-b border-gray-300 mb-2">過去カルテ（最新3件）</h2>
            {records.slice(1, 4).map((record, idx) => (
              <div key={record.id} className="mb-6 pb-4 border-b border-dashed border-gray-300" style={{ pageBreakInside: 'avoid' }}>
                <div className="mb-2 flex justify-between">
                  <span className="font-bold">{record.date}</span>
                  <span>担当: {record.staffName || '未設定'}</span>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-gray-500 font-bold">主訴</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{record.chiefComplaint || '未入力'}</div>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-gray-500 font-bold">施術メニュー</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{record.menu || '未選択'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <div className="text-xs text-gray-500 font-bold">S (主観的情報)</div>
                    <div className="whitespace-pre-wrap leading-relaxed">{record.s || '未入力'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold">O (客観的情報)</div>
                    <div className="whitespace-pre-wrap leading-relaxed">{record.o || '未入力'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold">A (評価)</div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{record.a || '未入力'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold">P (計画)</div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{record.p || '未入力'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <MedicalRecordGallery
            records={records}
            onClose={() => setIsGalleryOpen(false)}
            initialImage={selectedImage || undefined}
          />
        )}
      </AnimatePresence>

      {/* Legacy Image Modal (kept for quick view if needed, but gallery is preferred) */}
      {selectedImage && !isGalleryOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in" 
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-stone-300 bg-black/50 rounded-full p-2 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          <div className="flex flex-col items-center gap-4">
            <img 
              src={selectedImage} 
              alt="拡大画像" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGalleryOpen(true);
              }}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition-all"
            >
              ギャラリーで開く（比較・一覧）
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
