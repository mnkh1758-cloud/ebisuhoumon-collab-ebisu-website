import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, CreditCard, Banknote, Smartphone, Wallet, FileText, ChevronRight, User, Hash, ShieldCheck, Clock, AlertCircle, Printer, ArrowLeft, Zap } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { PaymentOptions, FeeMaster, FeeMasterItem } from '../../types';
import { formatPaymentTag } from '../lib/paymentUtils';

const BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  jcb: 'JCB',
  amex: 'Amex',
  diners: 'Diners',
  paypay: 'PayPay',
  rakuten_pay: '楽天ペイ',
  d_barai: 'd払い',
  au_pay: 'au PAY',
  id: 'iD',
  quicpay: 'QUICPay',
  transit_ic: '交通系IC',
  other: 'その他'
};

const DEFAULT_CARD_BRANDS = ['visa', 'mastercard', 'jcb'];
const DEFAULT_EMONEY_BRANDS = ['paypay', 'rakuten_pay', 'd_barai', 'au_pay'];

interface SimpleCheckoutModalProps {
  reservation: any;
  onClose: () => void;
  onConfirm: (data: any) => void;
  isSaving?: boolean;
}

export const SimpleCheckoutModal: React.FC<SimpleCheckoutModalProps> = ({ reservation, onClose, onConfirm, isSaving }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'emoney' | 'other' | 'credit_sale'>('cash');
  const [cardType, setCardType] = useState('Visa');
  const [emoneyType, setEmoneyType] = useState('PayPay');
  const [otherMethod, setOtherMethod] = useState('');
  const [creditSaleMemo, setCreditSaleMemo] = useState('');
  const [previousCheckout, setPreviousCheckout] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [activeFeeMaster, setActiveFeeMaster] = useState<FeeMaster | null>(null);
  const [isLoadingFeeMaster, setIsLoadingFeeMaster] = useState(false);
  
  const [amounts, setAmounts] = useState({
    insurance: reservation.insuranceAmount || 0,
    self: reservation.selfPayTreatmentAmount || 0,
    option: reservation.optionAmount || 0
  });

  // Computed payment types based on settings or fallback
  const cardTypes = React.useMemo(() => {
    const brands = paymentOptions?.cardBrands || DEFAULT_CARD_BRANDS;
    const types = brands.map(b => BRAND_LABELS[b] || b);
    if (!types.includes('その他')) types.push('その他');
    return types;
  }, [paymentOptions]);

  const emoneyTypes = React.useMemo(() => {
    const brands = paymentOptions?.eMoneyBrands || DEFAULT_EMONEY_BRANDS;
    const types = brands.map(b => BRAND_LABELS[b] || b);
    if (!types.includes('その他')) types.push('その他');
    return types;
  }, [paymentOptions]);

  const otherLabels = paymentOptions?.otherPaymentLabels || [];

  // Load previous checkout history and clinic settings
  useEffect(() => {
    const fetchData = async () => {
      const clinicIdMatch = window.location.search.match(/clinicId=([^&]+)/);
      const clinicId = clinicIdMatch ? clinicIdMatch[1] : '';
      if (!clinicId) return;

      // 1. Fetch Clinic Settings (Payment Options)
      try {
        const settingsRef = doc(db, `clinics/${clinicId}/settings`, 'general');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.paymentOptions) {
            setPaymentOptions(data.paymentOptions);
          }
        }
      } catch (error) {
        console.error('Error fetching payment options:', error);
      }

      // 2. Fetch History
      if (!reservation.patientId) return;
      setIsLoadingHistory(true);
      try {
        const q = query(
          collection(db, `clinics/${clinicId}/reservations`),
          where('patientId', '==', reservation.patientId),
          where('visitStatus', '==', 'completed'),
          orderBy('date', 'desc'),
          orderBy('startTime', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const pastResList = querySnapshot.docs.map(doc => doc.data());
        
        const lastWithCheckout = pastResList.find(p => p.id !== reservation.id && p.checkout);
        if (lastWithCheckout) {
          setPreviousCheckout(lastWithCheckout.checkout);
          
          const prevType = lastWithCheckout.checkout.payment?.paymentMethodType;
          if (prevType) {
            const mappedType = prevType === 'e_money' ? 'emoney' : 
                               prevType === 'accounts_receivable' ? 'credit_sale' : prevType;
            if (['cash', 'card', 'emoney', 'other', 'credit_sale'].includes(mappedType)) {
              setPaymentMethod(mappedType as any);
            }
            
            const prevDetail = lastWithCheckout.checkout.payment?.paymentMethodDetail;
            if (prevDetail) {
              const displayLabel = BRAND_LABELS[prevDetail] || prevDetail;
              if (prevType === 'card') {
                // Set only if available in the current narrowed list
                setCardType(prevDetail === 'other' ? 'その他' : displayLabel);
              }
              if (prevType === 'e_money') {
                setEmoneyType(prevDetail === 'other' ? 'その他' : displayLabel);
              }
              if (prevType === 'other') {
                setOtherMethod(prevDetail);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching patient history:', error);
      } finally {
        setIsLoadingHistory(false);
      }

      // 3. Fetch Active Fee Master (Foundation for v2)
      setIsLoadingFeeMaster(true);
      try {
        const feeMasterRef = collection(db, `clinics/${clinicId}/feeMasters`);
        const q = query(
          feeMasterRef, 
          where('isActive', '==', true),
          where('category', '==', reservation.category || 'jusei'),
          orderBy('effectiveFrom', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data() as FeeMaster;
          setActiveFeeMaster({ id: snap.docs[0].id, ...data });
          console.log("Fee Master loaded:", snap.docs[0].id);
        }
      } catch (err) {
        // Fallback: Continue without fee master if failed or not found
        console.warn("Fee Master could not be loaded or is not set yet. Manual entry will remain.");
      } finally {
        setIsLoadingFeeMaster(false);
      }
    };

    fetchData();
  }, [reservation.patientId, reservation.id]);

  const [memos, setMemos] = useState({
    payment: reservation.paymentMemo || '',
    reception: '',
    remarks: ''
  });

  const applyFeeItem = (item: FeeMasterItem, target: 'insurance' | 'self' | 'option') => {
    setAmounts(prev => ({
      ...prev,
      [target]: (prev[target] || 0) + item.amount
    }));
  };

  const totalAmount = amounts.insurance + amounts.self + amounts.option;

  const paymentMethods = [
    { id: 'cash', label: '現金', icon: <Banknote size={20} />, color: 'emerald' },
    { id: 'card', label: 'カード', icon: <CreditCard size={20} />, color: 'blue' },
    { id: 'emoney', label: '電子マネー', icon: <Smartphone size={20} />, color: 'purple' },
    { id: 'other', label: 'その他', icon: <Wallet size={20} />, color: 'stone' },
    { id: 'credit_sale', label: '売掛', icon: <FileText size={20} />, color: 'orange' },
  ];

  const handleConfirm = () => {
    // Mapping for normalization
    const typeMap: Record<string, string> = {
      cash: 'cash',
      card: 'card',
      emoney: 'e_money',
      other: 'other',
      credit_sale: 'accounts_receivable'
    };

    // Create reverse label map for IDs
    const reverseBrandMap: Record<string, string> = {};
    Object.entries(BRAND_LABELS).forEach(([id, label]) => {
      reverseBrandMap[label] = id;
    });

    const isReceivable = paymentMethod === 'credit_sale';
    const detail = paymentMethod === 'card' ? reverseBrandMap[cardType] || 'other' 
                 : paymentMethod === 'emoney' ? reverseBrandMap[emoneyType] || 'other'
                 : paymentMethod === 'other' ? (otherMethod || 'other')
                 : '';

    const checkoutData = {
      checkoutStatus: 'completed',
      amounts: {
        insuranceAmount: amounts.insurance,
        selfPayAmount: amounts.self,
        optionAmount: amounts.option,
        totalAmount: totalAmount
      },
      payment: {
        paymentMethodType: typeMap[paymentMethod] || 'other',
        paymentMethodDetail: detail,
        paymentMemo: memos.payment
      },
      receivable: {
        isReceivable: isReceivable,
        receivableAmount: isReceivable ? totalAmount : 0,
        receivableMemo: isReceivable ? creditSaleMemo : ''
      }
    };

    onConfirm(checkoutData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        
        {/* Header: Patient Info */}
        <div className="bg-stone-50 border-b border-stone-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <User size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-stone-800 tracking-tight">{reservation.patientName || '未設定'} 様</h2>
                  <span className="bg-stone-200 text-stone-600 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                    <Hash size={12} /> {reservation.patientId || '---'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                    <ShieldCheck size={14} /> 保険種別: <span className="text-stone-600">{reservation.category === 'jusei' ? '受領委任（柔整）' : '自由診療/通常'}</span>
                  </span>
                  <span className="text-stone-200 mx-1">|</span>
                  <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                    <User size={14} /> 担当: <span className="text-stone-600">山田 太郎</span>
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mr-2">前回支払い履歴</span>
            <div className="flex gap-2 min-h-[22px]">
              {isLoadingHistory ? (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-stone-200 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-stone-200 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-stone-200 rounded-full animate-bounce delay-150"></div>
                </div>
              ) : previousCheckout ? (
                formatPaymentTag(previousCheckout)
              ) : (
                <span className="text-[10px] font-bold text-stone-300">なし</span>
              )}
            </div>
          </div>

          {/* Fee Master Indicator (Minimalist v2 Foundation) */}
          {activeFeeMaster && (
            <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in duration-500">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-blue-700">料金マスタ適用可能: {activeFeeMaster.effectiveFrom}〜版</span>
              <span className="ml-auto text-[10px] text-blue-400 font-medium">({activeFeeMaster.items.length}項目)</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Amounts & Payment Method */}
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-black text-stone-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                金額入力
              </h3>

              {/* Fee Master Quick Select (v2 Early Access) */}
              {activeFeeMaster && activeFeeMaster.items.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] animate-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">マスタからクイック入力</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFeeMaster.items.filter(item => item.enabled).map(item => (
                      <div key={item.code} className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl p-1.5 pr-2.5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-stone-700 leading-tight">{item.label}</span>
                          <span className="text-[10px] font-black text-blue-600 mt-0.5">¥{item.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-stone-100 mx-1"></div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => applyFeeItem(item, 'insurance')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black hover:bg-emerald-100 active:scale-95 transition-all"
                          >
                            保険へ
                          </button>
                          <button 
                            onClick={() => applyFeeItem(item, 'self')}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black hover:bg-blue-100 active:scale-95 transition-all"
                          >
                            自費へ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 ml-1">保険(窓口負担)</label>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold group-focus-within:text-emerald-500">¥</span>
                    <input 
                      type="number"
                      value={amounts.insurance || ''}
                      onChange={e => setAmounts({...amounts, insurance: parseInt(e.target.value) || 0})}
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white rounded-2xl pl-10 pr-4 py-3 outline-none transition-all font-black text-stone-800"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 ml-1">自費(施術分)</label>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold group-focus-within:text-emerald-500">¥</span>
                    <input 
                      type="number"
                      value={amounts.self || ''}
                      onChange={e => setAmounts({...amounts, self: parseInt(e.target.value) || 0})}
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white rounded-2xl pl-10 pr-4 py-3 outline-none transition-all font-black text-stone-800"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-stone-500 ml-1">オプション・物品等</label>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold group-focus-within:text-emerald-500">¥</span>
                    <input 
                      type="number"
                      value={amounts.option || ''}
                      onChange={e => setAmounts({...amounts, option: parseInt(e.target.value) || 0})}
                      className="w-full bg-stone-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white rounded-2xl pl-10 pr-4 py-3 outline-none transition-all font-black text-stone-800"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 bg-stone-900 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="text-stone-400 text-xs font-bold mb-1 uppercase tracking-widest">合計請求金額 (Total Billing)</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-4xl font-black">¥{totalAmount.toLocaleString()}</span>
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-500/20 px-2 py-0.5 rounded">TAX INCL.</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black text-stone-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                支払い方法
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all group ${
                      paymentMethod === method.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-50'
                        : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className={`${
                      paymentMethod === method.id ? 'text-emerald-600 scale-110' : 'text-stone-300 group-hover:text-stone-500'
                    } transition-all`}>
                      {method.icon}
                    </div>
                    <span className="text-[10px] font-black tracking-tighter">{method.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Side: Details & Memos */}
          <div className="space-y-8">
            <section className="bg-stone-50/50 p-6 rounded-3xl border border-stone-100 min-h-[180px]">
              <h3 className="text-sm font-black text-stone-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                詳細選択
              </h3>
              
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {paymentMethod === 'cash' && (
                  <div className="flex flex-col items-center justify-center h-full text-stone-400 py-4">
                    <Banknote size={32} className="mb-2 opacity-20" />
                    <p className="text-xs font-bold tracking-tight">現金支払いに特記事項はありません</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">カードブランド</label>
                    <div className="grid grid-cols-3 gap-2">
                      {cardTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setCardType(type)}
                          className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                            cardType === type
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'emoney' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">電子マネー種別</label>
                    <div className="grid grid-cols-3 gap-2">
                      {emoneyTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setEmoneyType(type)}
                          className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                            emoneyType === type
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'other' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">その他支払い詳細</label>
                    <input 
                      type="text"
                      value={otherMethod}
                      onChange={e => setOtherMethod(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-400 text-sm font-medium"
                      placeholder="例：ポイント利用、商品券など"
                    />
                    {otherLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {otherLabels.map(label => (
                          <button
                            key={label}
                            onClick={() => setOtherMethod(label)}
                            className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-[10px] font-black transition-all"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'credit_sale' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">売掛メモ</label>
                    <textarea 
                      value={creditSaleMemo}
                      onChange={e => setCreditSaleMemo(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-sm font-medium h-24 resize-none"
                      placeholder="未入金理由、支払予定日など"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-black text-stone-800 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-400 rounded-full"></div>
                メモ・補足
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">支払いメモ (証憑記録用)</label>
                  <input 
                    type="text"
                    value={memos.payment}
                    onChange={e => setMemos({...memos, payment: e.target.value})}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-stone-200 text-xs font-medium"
                    placeholder="領収書の但し書きなど"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">受付メモ (院内共有用)</label>
                  <input 
                    type="text"
                    value={memos.reception}
                    onChange={e => setMemos({...memos, reception: e.target.value})}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-stone-200 text-xs font-medium"
                    placeholder="次回来院の際の伝達事項など"
                  />
                </div>
                <div className="space-y-1.5 text-right">
                  <button className="text-[10px] text-stone-400 font-bold hover:text-stone-600 underline">さらに詳細な備考を追加</button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer: Actions */}
        <div className="bg-stone-50 border-t border-stone-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-stone-200 text-stone-600 rounded-2xl text-sm font-black hover:bg-stone-50 transition-all active:scale-95"
            >
              <ArrowLeft size={18} />
              戻る
            </button>
            <button 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-stone-200 text-stone-600 rounded-2xl text-sm font-black hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-50"
              onClick={() => {}}
            >
              <Printer size={18} />
              領収書作成
            </button>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={isSaving}
            className="w-full md:w-auto md:min-w-[240px] flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] text-lg font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 size={24} />
                清算を確定する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
