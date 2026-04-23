import React from 'react';
import { CreditCard, Banknote, Smartphone, Wallet, FileText } from 'lucide-react';

export const formatPaymentTag = (checkout: any) => {
  if (!checkout || !checkout.payment) return null;

  const { paymentMethodType, paymentMethodDetail } = checkout.payment;
  const isReceivable = checkout.receivable?.isReceivable || paymentMethodType === 'accounts_receivable';

  const type = (paymentMethodType || '').toLowerCase();
  const detail = (paymentMethodDetail || '').toUpperCase();

  // Color Mapping
  // CASH: Gray
  // CARD: Blue
  // E-MONEY: Purple
  // AR: Red (Emphasis)
  // OTHER: Slate
  
  let label = '';
  let icon = null;
  let colors = '';
  let detailText = detail ? ` ${detail}` : '';

  switch (type) {
    case 'cash':
      label = '[CASH]';
      icon = <Banknote size={10} />;
      colors = 'bg-slate-300 text-slate-800 border-slate-400';
      detailText = ''; // Cash usually doesn't have detail
      break;
    case 'card':
      label = '[CARD]';
      icon = <CreditCard size={10} />;
      colors = 'bg-blue-200 text-blue-800 border-blue-300';
      break;
    case 'e_money':
    case 'emoney':
      label = '[E-MONEY]';
      icon = <Smartphone size={10} />;
      colors = 'bg-purple-200 text-purple-800 border-purple-300';
      // Normalize specific e-money details for display
      if (detail === 'PAYPAY') detailText = ' PAYPAY';
      if (detail === 'RAKUTEN_PAY') detailText = ' RAKUTEN PAY';
      if (detail === 'D_BARAI') detailText = ' d払い';
      if (detail === 'AU_PAY') detailText = ' AU PAY';
      if (detail === 'TRANSIT_IC') detailText = ' 交通系IC';
      break;
    case 'accounts_receivable':
    case 'credit_sale':
      label = '[AR] 売掛';
      icon = <FileText size={10} />;
      colors = 'bg-red-200 text-red-800 border-red-300 border font-bold shadow-sm';
      detailText = '';
      break;
    default:
      label = `[OTHER]`;
      icon = <Wallet size={10} />;
      colors = 'bg-slate-200 text-slate-700 border-slate-300';
      detailText = detail ? ` ${detail}` : '';
  }

  // If AR is detected by flag but not type, override
  if (isReceivable) {
      label = '[AR] 売掛';
      icon = <FileText size={10} />;
      colors = 'bg-red-200 text-red-800 border-red-300 border font-bold shadow-sm';
      detailText = '';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 border transition-all ${colors}`}>
      {icon}
      {label}{detailText}
    </span>
  );
};
