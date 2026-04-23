import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Patient, AdminStaff, FeatureFlags } from '../../types';
import { FileText, Search, User, Calendar, ChevronRight } from 'lucide-react';
import { perf } from '@/ledger/utils/performance';
import { ChartEditor } from '../components/ChartEditor';
import { FeatureLock } from '../../components/common/FeatureLock';

export const Records: React.FC = () => {
  const { clinicId, featureFlags } = useOutletContext<{ clinicId: string, featureFlags: FeatureFlags }>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    perf.start('Records_load');
    if (!clinicId || !featureFlags.canUseChart) return;
    const q = query(collection(db, `clinics/${clinicId}/patients`), orderBy('lastVisit', 'desc'), limit(100));
    return onSnapshot(q, (s) => {
      perf.mark('Records_data_received');
      setPatients(s.docs.map(d => ({ id: d.id, ...d.data() } as Patient)));
      setLoading(false);
      perf.end('Records_load');
    }, (e) => {
      handleFirestoreError(e, OperationType.LIST, `clinics/${clinicId}/patients`);
      setLoading(false);
      perf.end('Records_load');
    });
  }, [clinicId, featureFlags.canUseChart]);

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.patientId.toString().includes(term)
    );
  }, [patients, searchTerm]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-6"><div className="h-8 w-12 bg-stone-100 rounded-lg"></div></td>
      <td className="p-6"><div className="h-7 w-32 bg-stone-100 rounded-lg"></div></td>
      <td className="p-6"><div className="h-5 w-24 bg-stone-100 rounded-lg"></div></td>
      <td className="p-6 text-right"><div className="ml-auto h-10 w-24 bg-stone-50 rounded-xl"></div></td>
    </tr>
  );

  if (!featureFlags.canUseChart) {
    return (
      <FeatureLock 
        title="電子カルテはスタンダードプラン以上です"
        description="施術記録のデジタル管理、AIアシスト機能、過去の履歴参照などを利用するには、スタンダードプランへのアップグレードが必要です。"
        planRequired="standard"
      />
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800">カルテ管理</h2>
            <p className="text-sm text-stone-500 font-medium">患者ごとの施術記録の作成・閲覧</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="患者名・IDで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-stone-50 z-10">
              <tr className="border-b border-stone-200 text-stone-500 text-xs uppercase tracking-widest">
                <th className="p-6 font-black w-24">ID</th>
                <th className="p-6 font-black">氏名</th>
                <th className="p-6 font-black">最終来院</th>
                <th className="p-6 font-black text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => setEditingPatient(patient)}
                  >
                    <td className="p-6">
                      <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                        {patient.patientId}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-stone-800 text-lg">{patient.name}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-stone-500 font-bold text-sm">
                        <Calendar size={14} />
                        {formatDate(patient.lastVisit)}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 px-4 py-2 rounded-xl font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-95">
                        カルテ入力
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center">
                        <User size={40} className="text-stone-200" />
                      </div>
                      <p className="text-stone-400 font-bold">患者が見つかりません</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Editor Modal */}
      {editingPatient && (
        <ChartEditor
          clinicId={clinicId}
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
        />
      )}
    </div>
  );
};
