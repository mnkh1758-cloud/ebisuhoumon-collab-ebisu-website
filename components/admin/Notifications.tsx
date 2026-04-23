import React from 'react';
import { useParams } from 'react-router-dom';
import { Bell, Mail, MessageCircle } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">通知設定</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <h3 className="text-lg font-bold text-stone-800">メール通知</h3>
          </div>
          <p className="text-stone-500 mb-4">
            ※予約完了時やキャンセル時に自動送信されるメールの設定は、今後のアップデートで追加されます。
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-lg font-bold text-stone-800">LINE通知</h3>
          </div>
          <p className="text-stone-500 mb-4">
            ※LINE公式アカウントとの連携および自動通知設定は、今後のアップデートで追加されます。
          </p>
        </div>
      </div>
    </div>
  );
};
