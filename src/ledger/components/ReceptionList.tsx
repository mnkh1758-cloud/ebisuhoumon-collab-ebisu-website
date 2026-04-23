import React, { useState, useMemo } from 'react';
import { Reservation, AdminStaff, Patient } from '../../types';
import { SelfMenuPanel } from './SelfMenuPanel';
import { PaymentPanel } from './PaymentPanel';
import { CheckCircle, Clock, Check, Plus, CreditCard, User, FileText } from 'lucide-react';

interface ReceptionListProps {
  reservations: Reservation[];
  onUpdate: (id: string, data: Partial<Reservation>) => void;
  staffMap: Record<string, AdminStaff>;
  patientMap: Record<string, Patient>;
}

export const ReceptionList: React.FC<ReceptionListProps> = ({ reservations, onUpdate, staffMap, patientMap }) => {
  const [activeSelfMenuId, setActiveSelfMenuId] = useState<string | null>(null);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  // 状態変更ロジック
  const handleStatusChange = (res: Reservation) => {
    let nextStatus: Reservation['visitStatus'] = 'arrived';
    if (res.visitStatus === 'arrived') nextStatus = 'waiting_for_payment';
    else if (res.visitStatus === 'waiting_for_payment') nextStatus = 'completed';
    else if (res.visitStatus === 'completed') nextStatus = 'not_arrived'; // リセット用

    onUpdate(res.id, { visitStatus: nextStatus });
  };

  // 状態に応じたスタイルとテキスト
  const getStatusProps = (status?: string) => {
    switch (status) {
      case 'arrived':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200', text: '来院済', icon: <User size={16} /> };
      case 'waiting_for_payment':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200', text: '会計待ち', icon: <Clock size={16} /> };
      case 'completed':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200', text: '完了', icon: <CheckCircle size={16} /> };
      default:
        return { bg: 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200', text: '未来院', icon: <Check size={16} /> };
    }
  };

  // 支払い方法のテキスト
  const getPaymentText = (method?: string) => {
    switch (method) {
      case 'cash': return '現金';
      case 'credit': return 'クレジット';
      case 'emoney': return '電子マネー';
      case 'credit_sale': return '売掛';
      default: return '未設定';
    }
  };

  // 施術区分のテキスト
  const getCategoryText = (cat?: string) => {
    if (cat === 'jusei') return '柔整';
    if (cat === 'shinkyu') return '鍼灸';
    return '-';
  };

  // 合計計算
  const totals = useMemo(() => {
    let self = 0;
    let grand = 0;
    let cash = 0;

    reservations.forEach(r => {
      if (r.visitStatus === 'completed') {
        const sTotal = r.selfTotal || 0;
        const gTotal = r.grandTotal || 0;
        self += sTotal;
        grand += gTotal;
        if (r.paymentMethod === 'cash') {
          cash += gTotal;
        }
      }
    });

    return { self, grand, cash };
  }, [reservations]);

  return (
    <div className="flex flex-col h-full">
      {/* 合計ヘッダー */}
      <div className="bg-stone-50 p-4 border-b border-stone-200 flex gap-6 items-center shrink-0">
        <div className="text-sm font-medium text-stone-500">本日の完了分合計:</div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 block mb-1">自費合計</span>
            <span className="text-lg font-bold text-stone-800">¥{totals.self.toLocaleString()}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 block mb-1">総合計</span>
            <span className="text-lg font-bold text-stone-800">¥{totals.grand.toLocaleString()}</span>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 shadow-sm">
            <span className="text-xs text-emerald-600 block mb-1">現金合計</span>
            <span className="text-lg font-bold text-emerald-700">¥{totals.cash.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* リスト本体 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-100 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-32">状態</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-24">時間</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200">患者名</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-20">区分</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-24">担当</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-48">自費メニュー</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-24">自費合計</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-24">総合計</th>
              <th className="p-3 text-sm font-medium text-stone-600 border-b border-stone-200 w-32">支払方法</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-stone-500">
                  本日の予約はありません
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const statusProps = getStatusProps(res.visitStatus);
                const patientName = res.patientName || 
                  (res.patientDocId && patientMap[res.patientDocId]?.name) || 
                  (res.patientId && patientMap[res.patientId.toString()]?.name) || 
                  '未設定';
                const staffName = res.staffId && staffMap[res.staffId] ? staffMap[res.staffId].name : '-';
                
                return (
                  <tr key={res.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="p-2">
                      <button
                        onClick={() => handleStatusChange(res)}
                        className={`w-full flex items-center justify-center gap-1 py-2 px-2 rounded-lg border font-bold text-sm transition-colors ${statusProps.bg}`}
                      >
                        {statusProps.icon}
                        {statusProps.text}
                      </button>
                    </td>
                    <td className="p-3 text-sm font-medium text-stone-700">
                      {res.startTime}
                    </td>
                    <td className="p-3 font-bold text-stone-800">
                      {patientName}
                    </td>
                    <td className="p-3 text-sm text-stone-600">
                      <select 
                        value={res.category || ''}
                        onChange={(e) => onUpdate(res.id, { category: e.target.value as any })}
                        className="bg-transparent border-none p-0 cursor-pointer focus:ring-0"
                      >
                        <option value="">要確認</option>
                        <option value="jusei">柔整</option>
                        <option value="shinkyu">鍼灸</option>
                      </select>
                    </td>
                    <td className="p-3 text-sm text-stone-600">
                      {staffName}
                    </td>
                    <td className="p-2 relative">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex flex-wrap gap-1">
                          {(res.selfMenus || []).map((menu, idx) => (
                            <span key={idx} className="bg-stone-200 text-stone-700 text-xs px-2 py-1 rounded-md truncate max-w-[100px]">
                              {menu}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => setActiveSelfMenuId(activeSelfMenuId === res.id ? null : res.id)}
                          className="p-1.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors shrink-0"
                          title="自費追加"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {/* 自費メニューパネル */}
                      {activeSelfMenuId === res.id && (
                        <SelfMenuPanel
                          reservation={res}
                          onUpdate={onUpdate}
                          onClose={() => setActiveSelfMenuId(null)}
                        />
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={res.selfTotal || ''}
                        onChange={(e) => onUpdate(res.id, { selfTotal: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={res.grandTotal || ''}
                        onChange={(e) => onUpdate(res.id, { grandTotal: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 relative">
                      <button
                        onClick={() => setActivePaymentId(activePaymentId === res.id ? null : res.id)}
                        className="w-full flex items-center justify-between bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm hover:bg-stone-50 transition-colors"
                      >
                        <span className="truncate">{getPaymentText(res.paymentMethod)}</span>
                        <CreditCard size={14} className="text-stone-400 shrink-0" />
                      </button>

                      {/* 支払い方法パネル */}
                      {activePaymentId === res.id && (
                        <PaymentPanel
                          reservation={res}
                          onUpdate={onUpdate}
                          onClose={() => setActivePaymentId(null)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
