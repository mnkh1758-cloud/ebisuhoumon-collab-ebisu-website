import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { PaymentOptions, UserProfile } from '../../types';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Banknote
} from 'lucide-react';

export const SettingsPaymentMethods: React.FC = () => {
  const { clinicId, userProfile } = useOutletContext<{ clinicId: string, userProfile: UserProfile }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions>({
    cardBrands: ['visa', 'mastercard', 'jcb'],
    eMoneyBrands: ['paypay', 'rakuten_pay', 'd_barai', 'au_pay'],
    otherPaymentLabels: []
  });

  const cardBrandsList = [
    { id: 'visa', label: 'Visa' },
    { id: 'mastercard', label: 'Mastercard' },
    { id: 'jcb', label: 'JCB' },
    { id: 'amex', label: 'Amex' },
    { id: 'diners', label: 'Diners' },
    { id: 'other', label: 'その他' },
  ];

  const eMoneyBrandsList = [
    { id: 'paypay', label: 'PayPay' },
    { id: 'rakuten_pay', label: '楽天ペイ' },
    { id: 'd_barai', label: 'd払い' },
    { id: 'au_pay', label: 'au PAY' },
    { id: 'id', label: 'iD' },
    { id: 'quicpay', label: 'QUICPay' },
    { id: 'transit_ic', label: '交通系IC' },
    { id: 'other', label: 'その他' },
  ];

  useEffect(() => {
    if (!clinicId) return;

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, `clinics/${clinicId}/settings`, 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.paymentOptions) {
            setPaymentOptions({
              cardBrands: data.paymentOptions.cardBrands || [],
              eMoneyBrands: data.paymentOptions.eMoneyBrands || [],
              otherPaymentLabels: data.paymentOptions.otherPaymentLabels || []
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `clinics/${clinicId}/settings/general`);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [clinicId]);

  const handleSave = async () => {
    if (!clinicId) return;
    if (userProfile?.role === 'staff') {
      alert('スタッフ権限では設定の変更はできません。');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const docRef = doc(db, `clinics/${clinicId}/settings`, 'general');
      await updateDoc(docRef, {
        paymentOptions: paymentOptions,
        updatedAt: new Date()
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}/settings/general`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCardBrand = (id: string) => {
    setPaymentOptions(prev => {
      const exists = prev.cardBrands.includes(id);
      return {
        ...prev,
        cardBrands: exists 
          ? prev.cardBrands.filter(b => b !== id) 
          : [...prev.cardBrands, id]
      };
    });
  };

  const toggleEMoneyBrand = (id: string) => {
    setPaymentOptions(prev => {
      const exists = prev.eMoneyBrands.includes(id);
      return {
        ...prev,
        eMoneyBrands: exists 
          ? prev.eMoneyBrands.filter(b => b !== id) 
          : [...prev.eMoneyBrands, id]
      };
    });
  };

  const addOtherLabel = () => {
    setPaymentOptions(prev => ({
      ...prev,
      otherPaymentLabels: [...prev.otherPaymentLabels, '']
    }));
  };

  const updateOtherLabel = (index: number, value: string) => {
    setPaymentOptions(prev => {
      const newList = [...prev.otherPaymentLabels];
      newList[index] = value;
      return { ...prev, otherPaymentLabels: newList };
    });
  };

  const removeOtherLabel = (index: number) => {
    setPaymentOptions(prev => ({
      ...prev,
      otherPaymentLabels: prev.otherPaymentLabels.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-800">支払い方法設定</h2>
            <p className="text-sm text-stone-500 font-bold">清算画面で表示される項目の管理</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus === 'success' && (
            <span className="text-emerald-600 font-bold flex items-center gap-1 text-sm">
              <CheckCircle2 size={18} /> 保存しました
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            設定を保存
          </button>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto pb-12 custom-scrollbar pr-2">
        {/* Credit Cards */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-800">カードブランド</h3>
              <p className="text-xs text-stone-400 font-bold">清算画面で選択可能なクレジットカード会社</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {cardBrandsList.map(brand => (
              <label 
                key={brand.id}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                  paymentOptions.cardBrands.includes(brand.id) 
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/10' 
                    : 'bg-white border-stone-100 hover:border-stone-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  paymentOptions.cardBrands.includes(brand.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-stone-50 border-stone-200 group-hover:border-stone-300'
                }`}>
                  {paymentOptions.cardBrands.includes(brand.id) && <CheckCircle2 size={14} />}
                </div>
                <input 
                  type="checkbox"
                  checked={paymentOptions.cardBrands.includes(brand.id)}
                  onChange={() => toggleCardBrand(brand.id)}
                  className="hidden"
                />
                <span className={`font-black text-sm ${paymentOptions.cardBrands.includes(brand.id) ? 'text-blue-900' : 'text-stone-500'}`}>
                  {brand.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* E-Money */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-800">電子マネー</h3>
              <p className="text-xs text-stone-400 font-bold">QR決済・交通系ICカードなど</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {eMoneyBrandsList.map(brand => (
              <label 
                key={brand.id}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                  paymentOptions.eMoneyBrands.includes(brand.id) 
                    ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-500/10' 
                    : 'bg-white border-stone-100 hover:border-stone-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  paymentOptions.eMoneyBrands.includes(brand.id)
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-stone-50 border-stone-200 group-hover:border-stone-300'
                }`}>
                  {paymentOptions.eMoneyBrands.includes(brand.id) && <CheckCircle2 size={14} />}
                </div>
                <input 
                  type="checkbox"
                  checked={paymentOptions.eMoneyBrands.includes(brand.id)}
                  onChange={() => toggleEMoneyBrand(brand.id)}
                  className="hidden"
                />
                <span className={`font-black text-sm ${paymentOptions.eMoneyBrands.includes(brand.id) ? 'text-purple-900' : 'text-stone-500'}`}>
                  {brand.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Other Methods */}
        <section className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-800">その他支払い方法</h3>
                <p className="text-xs text-stone-400 font-bold">銀行振込、地域振興券、回数券など院独自の設定</p>
              </div>
            </div>
            <button 
              onClick={addOtherLabel}
              className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              <Plus size={18} /> 項目を追加
            </button>
          </div>

          <div className="space-y-3">
            {paymentOptions.otherPaymentLabels.map((label, index) => (
              <div key={index} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                <div className="flex-1 relative group">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="text"
                    value={label}
                    onChange={(e) => updateOtherLabel(index, e.target.value)}
                    placeholder="例：銀行振込"
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl pl-12 pr-4 py-4 font-bold text-stone-800 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => removeOtherLabel(index)}
                  className="w-14 h-14 rounded-2xl bg-stone-50 text-stone-300 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center border-2 border-transparent hover:border-rose-100 active:scale-95"
                  title="削除"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {paymentOptions.otherPaymentLabels.length === 0 && (
              <div className="text-center py-12 bg-stone-50 rounded-[2rem] border border-dashed border-stone-200">
                <p className="text-stone-400 font-bold text-sm mb-4">設定済みの独自支払い方法はありません</p>
                <button 
                  onClick={addOtherLabel}
                  className="inline-flex items-center gap-2 bg-white border-2 border-stone-100 px-6 py-3 rounded-2xl font-black text-stone-600 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                >
                  <Plus size={18} /> 最初の項目を追加
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
      `}} />
    </div>
  );
};
