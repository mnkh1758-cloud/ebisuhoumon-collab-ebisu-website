import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Reservation } from '../../types';
import { Calendar, Clock, User, FileText, CheckCircle2, AlertCircle, XCircle, Search, Copy } from 'lucide-react';

export const ReservationList: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!clinicId) return;

    const resRef = collection(db, `clinics/${clinicId}/reservations`);
    const q = query(resRef, orderBy('date', 'desc'), orderBy('startTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      setReservations(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/reservations`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clinicId]);

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      (res.patientName && res.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.patientId && res.patientId.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold"><CheckCircle2 size={14} /> 本予約</span>;
      case 'provisional':
        return <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-bold"><AlertCircle size={14} /> 仮予約</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold"><XCircle size={14} /> キャンセル</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-8 text-stone-500">読み込み中...</div>;
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Calendar className="text-emerald-600" />
          予約一覧
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="患者名または番号で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">すべてのステータス</option>
            <option value="confirmed">本予約</option>
            <option value="provisional">仮予約</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
                <th className="p-4 font-bold">日時</th>
                <th className="p-4 font-bold">患者情報</th>
                <th className="p-4 font-bold">メニュー</th>
                <th className="p-4 font-bold">ステータス</th>
                <th className="p-4 font-bold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-stone-800">{res.date}</div>
                      <div className="text-sm text-stone-500 flex items-center gap-1">
                        <Clock size={14} /> {res.startTime} - {res.endTime}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-800 flex items-center gap-2">
                        <User size={16} className="text-stone-400" />
                        {res.patientName || '新規患者'}
                      </div>
                      {res.patientId && (
                        <div className="text-sm text-stone-500">番号: {res.patientId}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-stone-800 font-medium">{res.menu || '-'}</div>
                      {res.memo && (
                        <div className="text-xs text-stone-500 mt-1 flex items-start gap-1">
                          <FileText size={12} className="shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{res.memo}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {res.questionnaireUrl && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(res.questionnaireUrl!);
                              alert('問診URLをコピーしました');
                            }}
                            className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-stone-200"
                            title="問診URLをコピー"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/${clinicId}?date=${res.date}`)}
                          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          詳細
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    該当する予約が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
