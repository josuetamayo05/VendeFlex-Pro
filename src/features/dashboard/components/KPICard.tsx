import React from 'react';

interface Props {
  label: string;
  value: string;
  badgeText?: string;
  badgeColor?: 'emerald' | 'blue' | 'rose' | 'amber';
  badgeIcon?: React.ReactNode;
  valueColor?: string;
  progress?: number;
}

const BADGE_STYLES = {
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  blue: 'text-blue-600 bg-blue-50 border-blue-100',
  rose: 'text-rose-600 bg-rose-50 border-rose-100',
  amber: 'text-amber-600 bg-amber-50 border-amber-100',
};

export const KPICard: React.FC<Props> = ({ 
  label, 
  value, 
  badgeText, 
  badgeColor = 'blue', 
  badgeIcon, 
  valueColor = 'text-slate-900',
  progress 
}) => {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-400">{label}</p>
          <h2 className={`text-2xl font-black mt-1 ${valueColor}`}>{value}</h2>
        </div>
        {badgeText && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${BADGE_STYLES[badgeColor]}`}>
            {badgeIcon}
            {badgeText}
          </span>
        )}
      </div>
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};