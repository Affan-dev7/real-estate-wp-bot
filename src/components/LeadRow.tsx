'use client';

import { Lead } from '@/lib/types';
import { getRequirementSummary, timeAgo, formatPhone } from '@/lib/formatters';
import { Flame, AlertCircle } from 'lucide-react';

interface LeadRowProps {
  lead: Lead;
  isSelected?: boolean;
  onClick: () => void;
}

export default function LeadRow({ lead, isSelected, onClick }: LeadRowProps) {
  const reqSummary = getRequirementSummary(lead);
  const time = timeAgo(lead.last_message_at);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`w-full text-left px-4 py-3.5 border-b border-[#E2E8F0] cursor-pointer transition-colors touch-target ${
        isSelected
          ? 'bg-[#E6F4F0] border-l-4 border-l-[#0E6B50]'
          : 'bg-white hover:bg-[#F7FAFC]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[#1A202C] truncate">
              {lead.name}
            </span>

            {lead.label === 'hot' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D9480F] bg-[#FDF2E9] px-2 py-0.5 rounded">
                <Flame className="w-3 h-3 fill-[#D9480F]" />
                Hot
              </span>
            )}

            {lead.bot_paused && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B43403] bg-[#FEF3C7] px-2 py-0.5 rounded">
                <AlertCircle className="w-3 h-3 text-[#B43403]" />
                Human needed
              </span>
            )}

            <span className="text-xs text-[#5A6578] font-mono">
              {formatPhone(lead.phone)}
            </span>
          </div>

          {/* One line of what they want */}
          <p className="text-xs text-[#5A6578] mt-1 truncate">
            {reqSummary}
          </p>
        </div>

        <div className="flex flex-col items-end shrink-0 text-right">
          <span className="text-[11px] text-[#5A6578] tabular-nums">
            {time}
          </span>
          <span className="text-[11px] text-[#1A202C] font-medium mt-1 capitalize">
            {lead.status.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}
