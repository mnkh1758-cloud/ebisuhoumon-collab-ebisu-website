import React from 'react';
import { X, Printer } from 'lucide-react';

interface ReceiptModalProps {
  reservation: any;
  clinicName: string;
  directorName: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ reservation, clinicName, directorName, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const paidDate = reservation.paidAt 
    ? (reservation.paidAt.seconds ? reservation.paidAt.toDate() : new Date(reservation.paidAt))
    : new Date();

  const formattedDate = `${paidDate.getFullYear()}年${String(paidDate.getMonth() + 1).padStart(2, '0')}月${String(paidDate.getDate()).padStart(2, '0')}日`;

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block print:absolute print:inset-0 print:z-[9999]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">
        {/* プレビューヘッダー */}
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50 print:hidden shrink-0">
          <h2 className="font-bold text-stone-800">領収書プレビュー</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
              <Printer size={18} /> 印刷する
            </button>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 領収書本体 (印刷対象) */}
        <div className="p-8 overflow-y-auto print:overflow-visible print:p-4 bg-white text-black h-full print:text-xs">
          <div className="max-w-xl mx-auto border-b-2 border-black pb-4 mb-6 print:pb-2 print:mb-3 text-center">
            <h1 className="text-2xl print:text-lg font-bold tracking-widest">領収証</h1>
          </div>
          
          <div className="flex justify-between items-start mb-8 print:mb-4">
            <div>
              <div className="text-xl print:text-base font-bold border-b border-black pb-1 mb-4 print:mb-2 inline-block min-w-[200px] print:min-w-[150px]">
                {reservation.patientName} 様
              </div>
              <div className="text-lg print:text-sm mb-2 print:mb-1">
                金額：<span className="text-2xl print:text-lg font-bold">¥{(reservation.billingAmount || 0).toLocaleString()}</span>-
              </div>
              <div className="text-sm print:text-[10px] text-gray-600">
                但し、治療代として上記正に領収いたしました。
              </div>
              <div className="text-sm print:text-[10px] text-gray-600 mt-2 print:mt-1">
                支払方法：{
                  reservation.paymentMethod === 'cash' ? '現金' :
                  reservation.paymentMethod === 'credit' ? 'クレジットカード' :
                  reservation.paymentMethod === 'emoney' ? '電子マネー' :
                  reservation.paymentMethod === 'credit_sale' ? '売掛' : '未設定'
                }
              </div>
            </div>
            
            <div className="text-right text-sm print:text-[10px]">
              <div className="mb-4 print:mb-2">
                発行日：{formattedDate}
              </div>
              <div className="font-bold text-lg print:text-sm mb-1">{clinicName}</div>
              <div className="mb-4 print:mb-2">院長：{directorName}</div>
              
              {/* 印鑑枠 */}
              <div className="w-16 h-16 print:w-10 print:h-10 border-2 border-red-500 rounded-full ml-auto flex items-center justify-center text-red-500 text-xs print:text-[8px] opacity-50">
                印
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-sm print:text-[10px] mb-6 print:mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 print:p-1 text-left">項目</th>
                <th className="border border-black p-2 print:p-1 text-right w-32 print:w-24">金額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 print:p-1">保険診療分</td>
                <td className="border border-black p-2 print:p-1 text-right">¥{(reservation.insuranceAmount || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 print:p-1">自費診療分</td>
                <td className="border border-black p-2 print:p-1 text-right">¥{(reservation.selfPayTreatmentAmount || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 print:p-1">オプション</td>
                <td className="border border-black p-2 print:p-1 text-right">¥{(reservation.optionAmount || 0).toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="border border-black p-2 print:p-1 text-right">合計</td>
                <td className="border border-black p-2 print:p-1 text-right">¥{(reservation.billingAmount || 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {reservation.paymentMemo && (
            <div className="text-sm print:text-[10px]">
              <span className="font-bold">備考：</span>
              <p className="mt-1 print:mt-0.5 whitespace-pre-wrap">{reservation.paymentMemo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
