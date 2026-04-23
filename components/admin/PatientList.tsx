import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { Patient } from '../../types';
import { Users, Search, Plus, UserPlus, X, ChevronRight, Phone } from 'lucide-react';

export const PatientList: React.FC<{ clinicId?: string }> = ({ clinicId: propClinicId }) => {
  const params = useParams<{ clinicId: string }>();
  const clinicId = propClinicId || params.clinicId;
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phoneNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (!clinicId) return;

    const patientsRef = collection(db, `clinics/${clinicId}/patients`);
    const q = query(patientsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/patients`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clinicId]);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = patient.name.toLowerCase().includes(searchLower);
    const matchesId = patient.patientId.toString().includes(searchLower);
    const matchesPhone = patient.phoneNumber?.replace(/-/g, '').includes(searchLower.replace(/-/g, ''));
    
    return matchesName || matchesId || matchesPhone;
  });

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId || !newPatient.name.trim()) return;

    setIsSaving(true);
    try {
      // 1. トランザクションで患者番号を自動採番
      const counterRef = doc(db, `clinics/${clinicId}/counters`, 'patientId');
      
      const newPatientId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let currentId = 0;
        
        if (counterDoc.exists()) {
          currentId = counterDoc.data().current || 0;
        }
        
        const nextId = currentId + 1;
        
        // カウンターを更新
        transaction.set(counterRef, { current: nextId }, { merge: true });
        
        return nextId;
      });

      // 2. 新規患者ドキュメントを作成
      const newPatientRef = doc(collection(db, `clinics/${clinicId}/patients`));
      const patientData: Omit<Patient, 'id'> = {
        patientId: newPatientId,
        name: newPatient.name.trim(),
        phoneNumber: newPatient.phoneNumber.trim(),
        notes: newPatient.notes.trim(),
        visitHistory: [],
        contraindications: '',
        lastVisit: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(newPatientRef, patientData);
      
      setIsModalOpen(false);
      setNewPatient({ name: '', phoneNumber: '', notes: '' });
      
      // 登録後、詳細画面へ遷移するかどうか（今回は一覧に留まる）
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `clinics/${clinicId}/patients`);
      alert('患者の登録に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '来院なし';
    const date = timestamp.toDate();
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return <div className="p-8 text-stone-500">読み込み中...</div>;
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Users className="text-emerald-600" />
          患者一覧
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="名前、番号、電話番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            <UserPlus size={18} /> 新規登録
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
                <th className="p-4 font-bold w-24">患者番号</th>
                <th className="p-4 font-bold">氏名</th>
                <th className="p-4 font-bold">電話番号</th>
                <th className="p-4 font-bold">最終来院日</th>
                <th className="p-4 font-bold text-right">詳細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/${clinicId}/patient/${patient.id}`)}
                  >
                    <td className="p-4">
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {patient.patientId}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-800">{patient.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-stone-600 flex items-center gap-1">
                        {patient.phoneNumber ? (
                          <>
                            <Phone size={14} className="text-stone-400" />
                            {patient.phoneNumber}
                          </>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-stone-600">
                        {formatDate(patient.lastVisit)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <ChevronRight size={20} className="text-stone-400 inline-block" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    該当する患者が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新規登録モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50 shrink-0">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <UserPlus size={20} className="text-emerald-600" />
                新規患者登録
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSavePatient} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例: 山田 太郎"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">電話番号</label>
                <input
                  type="tel"
                  value={newPatient.phoneNumber}
                  onChange={(e) => setNewPatient({...newPatient, phoneNumber: e.target.value})}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="例: 090-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">基本メモ</label>
                <textarea
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="特徴や紹介者など"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-stone-200 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !newPatient.name.trim()}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? '保存中...' : '登録する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
