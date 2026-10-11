import React from 'react';
import { History } from 'lucide-react';
import type { CampaignOffer } from '../../lib/newsletter';

interface CampaignHistoryTabProps {
  isAr: boolean;
  campaigns: CampaignOffer[];
}

export const CampaignHistoryTab: React.FC<CampaignHistoryTabProps> = ({
  isAr,
  campaigns,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#14171d] p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs">
        <span>{isAr ? 'سجل الحملات والرسائل الترويجية الموثقة:' : 'Sent Campaigns Archive:'}</span>
        <span className="text-[#004ad7] dark:text-[#60a5fa]">
          {campaigns.length} {isAr ? 'حملة مسجلة' : 'campaigns'}
        </span>
      </div>

      {campaigns.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 text-xs rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#14171d]">
          <History className="h-8 w-8 mx-auto text-zinc-400 mb-2 opacity-50" />
          <p>
            {isAr
              ? 'لم يتم إرسال أي حملات بعد. توجه إلى تبويب "واجهات العروض" لبدء حملتك الأولى!'
              : 'No campaigns recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#14171d] p-4 space-y-2 hover:border-[#004ad7]/30 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#004ad7] dark:bg-[#3b82f6]" />
                  <h4 className="text-xs font-bold text-black dark:text-white">{camp.title}</h4>
                  {camp.discount_code && (
                    <span className="rounded-full bg-[#004ad7]/10 dark:bg-[#004ad7]/20 px-2 py-0.5 text-[10px] text-[#004ad7] dark:text-[#60a5fa] font-bold">
                      {camp.discount_code}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-500">
                  {new Date(camp.created_at).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                {camp.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignHistoryTab;
