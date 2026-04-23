import React, { useRef, useEffect } from 'react';
import { Reservation } from '../../types';
import { X } from 'lucide-react';

interface SelfMenuPanelProps {
  reservation: Reservation;
  onUpdate: (id: string, data: Partial<Reservation>) => void;
  onClose: () => void;
}

const COMMON_MENUS = [
  { name: '骨盤矯正', price: 2200 },
  { name: '猫背矯正', price: 2200 },
  { name: '延長10分', price: 1100 },
  { name: '延長20分', price: 2200 },
  { name: '鍼追加', price: 1650 },
  { name: '灸追加', price: 1100 },
  { name: 'テーピング', price: 550 },
  { name: 'ハイボルト', price: 1100 },
];

export const SelfMenuPanel: React.FC<SelfMenuPanelProps> = ({ reservation, onUpdate, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // パネル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAddMenu = (menu: { name: string, price: number }) => {
    const currentMenus = reservation.selfMenus || [];
    const currentTotal = reservation.selfTotal || 0;
    const currentGrand = reservation.grandTotal || 0;

    onUpdate(reservation.id, {
      selfMenus: [...currentMenus, menu.name],
      selfTotal: currentTotal + menu.price,
      grandTotal: currentGrand + menu.price,
    });
  };

  const handleRemoveMenu = (indexToRemove: number) => {
    const currentMenus = reservation.selfMenus || [];
    const menuName = currentMenus[indexToRemove];
    const menuItem = COMMON_MENUS.find(m => m.name === menuName);
    const priceToDeduct = menuItem ? menuItem.price : 0;

    const currentTotal = reservation.selfTotal || 0;
    const currentGrand = reservation.grandTotal || 0;

    onUpdate(reservation.id, {
      selfMenus: currentMenus.filter((_, idx) => idx !== indexToRemove),
      selfTotal: Math.max(0, currentTotal - priceToDeduct),
      grandTotal: Math.max(0, currentGrand - priceToDeduct),
    });
  };

  return (
    <div 
      ref={panelRef}
      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 z-50 p-4"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-stone-800 text-sm">自費メニュー追加</h4>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
          <X size={16} />
        </button>
      </div>

      {/* 現在のメニュー */}
      <div className="mb-4">
        <div className="text-xs text-stone-500 mb-2">追加済み:</div>
        <div className="flex flex-wrap gap-2">
          {(reservation.selfMenus || []).length === 0 ? (
            <span className="text-xs text-stone-400">なし</span>
          ) : (
            (reservation.selfMenus || []).map((menu, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md border border-emerald-200">
                <span>{menu}</span>
                <button 
                  onClick={() => handleRemoveMenu(idx)}
                  className="text-emerald-500 hover:text-emerald-800 p-0.5 rounded-full hover:bg-emerald-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 追加ボタン群 */}
      <div className="grid grid-cols-2 gap-2">
        {COMMON_MENUS.map((menu) => (
          <button
            key={menu.name}
            onClick={() => handleAddMenu(menu)}
            className="text-left px-3 py-2 rounded-lg border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
          >
            <div className="font-medium text-sm text-stone-700 group-hover:text-emerald-700">{menu.name}</div>
            <div className="text-xs text-stone-500 group-hover:text-emerald-600">¥{menu.price.toLocaleString()}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
