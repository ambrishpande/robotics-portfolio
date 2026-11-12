import React from 'react';
import { FastForward } from 'lucide-react';
import { STATIONS, type StationId } from '../data/portfolioData';

interface Stage2TransitionHudProps {
  targetStation: Exclude<StationId, 'HOME'>;
  onSkipIntro: () => void;
}

export const Stage2TransitionHud: React.FC<Stage2TransitionHudProps> = ({
  targetStation,
  onSkipIntro,
}) => {
  const meta = STATIONS.find((s) => s.id === targetStation) ?? STATIONS[1];

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* Top-Right Skip Intro Button */}
      <div className="absolute top-24 sm:top-20 right-5 sm:right-8 pointer-events-auto">
        <button
          type="button"
          onClick={onSkipIntro}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-400/20 text-slate-100 text-xs font-medium transition-colors hover:bg-slate-800 cursor-pointer shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
        </button>
      </div>

      {/* Minimal Bottom Approach Caption */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none">
        <div
          className="px-4 py-2 rounded-lg border border-slate-400/20 flex items-center gap-2.5 shadow-xl"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: meta.accentHex }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-[#F8FAFC] whitespace-nowrap">
            {meta.label}
          </span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="font-mono-tech text-xs text-slate-400 whitespace-nowrap">
            {meta.gateTitle}
          </span>
        </div>
      </div>
    </div>
  );
};
