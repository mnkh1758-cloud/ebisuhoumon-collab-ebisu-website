import React, { useRef, useEffect } from 'react';
import { Reservation } from '../../types';
import { X, Banknote, CreditCard, Smartphone, FileText } from 'lucide-react';

interface PaymentPanelProps {
  reservation: Reservation;
  onUpdate: (id: string, data: Partial<Reservation>) => void;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  { id: 'cash', name: '現金', icon: <Banknote size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'credit', name: 'クレジット', icon: <CreditCard size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'emoney', name: '電子マネー', icon: <Smartphone size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'credit_sale', name: '売掛', icon: <FileText size={18} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
];

export const PaymentPanel: React.FC<PaymentPanelProps> = ({ reservation, onUpdate, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (methodId: string) => {
    onUpdate(reservation.id, { paymentMethod: methodId as any });
    onClose();
  };

  return (
    <div 
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-200 z-50 p-2"
    >
      <div className="flex justify-between items-center mb-2 px-2">
        <h4 className="font-bold text-stone-800 text-sm">支払方法</h4>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = reservation.paymentMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => handleSelect(method.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isSelected 
                  ? `${method.bg} ${method.color} border ${method.border}` 
                  : 'text-stone-600 hover:bg-stone-50 border border-transparent'
              }`}
            >
              <div className={isSelected ? method.color : 'text-stone-400'}>
                {method.icon}
              </div>
              {method.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
