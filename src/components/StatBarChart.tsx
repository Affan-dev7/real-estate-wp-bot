'use client';

interface BarData {
  date: string;
  label: string;
  count: number;
}

interface StatBarChartProps {
  data: BarData[];
  title?: string;
}

export default function StatBarChart({ data, title = 'New leads per day' }: StatBarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 130;

  return (
    <div className="bg-white border border-[#E2E8F0] p-4 rounded-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1A202C]">{title}</h3>
        <span className="text-xs text-[#5A6578]">Past 7 days</span>
      </div>

      <div className="flex items-end gap-2 sm:gap-4 h-36 pt-6 pb-2 border-b border-[#E2E8F0]">
        {data.map((item) => {
          const barHeightPct = Math.max(Math.round((item.count / maxCount) * 100), item.count > 0 ? 10 : 3);

          return (
            <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-[11px] font-semibold text-[#1A202C] tabular-nums mb-1">
                {item.count > 0 ? item.count : ''}
              </span>
              <div
                style={{ height: `${barHeightPct}%` }}
                className={`w-full max-w-[36px] transition-all ${
                  item.count > 0 ? 'bg-[#0E6B50]' : 'bg-[#E2E8F0]'
                }`}
                aria-label={`${item.label}: ${item.count} leads`}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 sm:gap-4 mt-2">
        {data.map((item) => (
          <div key={item.date} className="flex-1 text-center">
            <span className="text-[11px] text-[#5A6578] truncate block">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
