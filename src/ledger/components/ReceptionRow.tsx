import React from 'react';
import { Clock, FileText } from 'lucide-react';
import { Reservation, FeatureFlags } from '../../types';

interface ReceptionRowProps {
  res: Reservation;
  patientName: string;
  staffName: string;
  categoryLabel: string;
  action: { label: string; color: string; nextStatus: string | null };
  isPast: boolean;
  hasQuestionnaire: boolean;
  onStatusChange: (res: Reservation) => void;
  onOpenChart: (res: Reservation) => void;
  featureFlags: FeatureFlags;
}

export const ReceptionRow: React.FC<ReceptionRowProps> = React.memo(({ 
  res, 
  patientName, 
  staffName, 
  categoryLabel, 
  action, 
  isPast, 
  hasQuestionnaire,
  onStatusChange,
  onOpenChart,
  featureFlags
}) => {
  return (
    <tr className={`border-b border-stone-100 transition-colors ${isPast ? 'bg-red-50/30' : 'hover:bg-stone-50/50'}`}>
      <td className="p-4">
        <div className={`flex items-center gap-2 font-bold ${isPast ? 'text-red-600' : 'text-stone-800'}`}>
          <Clock size={14} />
          {res.startTime}
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <span className={`text-xs font-bold px-2 py-1 rounded text-center ${categoryLabel === '要確認' ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
            {categoryLabel}
          </span>
          {featureFlags.canUseQuestionnaire && (
            hasQuestionnaire ? (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-center">問診済</span>
            ) : (
              <span className="text-[10px] font-black text-stone-400 bg-stone-100 px-2 py-0.5 rounded text-center">問診未</span>
            )
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-stone-800">{patientName}</span>
          {featureFlags.canUseChart && (
            <button
              onClick={() => onOpenChart(res)}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all active:scale-90"
              title="カルテを入力"
            >
              <FileText size={16} />
            </button>
          )}
        </div>
      </td>
      <td className="p-4 text-sm text-stone-600">{staffName}</td>
      <td className="p-4 text-sm text-stone-600 truncate max-w-[200px]">{res.menu || '-'}</td>
      <td className="p-4">
        <button 
          onClick={() => onStatusChange(res)} 
          disabled={!action.nextStatus}
          className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${action.color}`}
        >
          {action.label}
        </button>
      </td>
      <td className="p-4 text-right font-mono font-bold text-stone-800">
        ¥{(res.grandTotal || 0).toLocaleString()}
      </td>
    </tr>
  );
});

ReceptionRow.displayName = 'ReceptionRow';
