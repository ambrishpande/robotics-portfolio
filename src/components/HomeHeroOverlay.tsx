import React from 'react';
import { ArrowRight } from 'lucide-react';
import {
  ENGINEER_PROFILE,
  STATIONS,
  type StationId,
} from '../data/portfolioData';

interface HomeHeroOverlayProps {
  onStartJourney: () => void;
  onSelectStation: (station: Exclude<StationId, 'HOME'>) => void;
  onHoverStation: (station: StationId | null) => void;
}

export const HomeHeroOverlay: React.FC<HomeHeroOverlayProps> = ({
  onStartJourney,
  onSelectStation,
  onHoverStation,
}) => {
  const quickStations = STATIONS.filter(
    (s): s is (typeof STATIONS)[number] & { id: Exclude<StationId, 'HOME'> } =>
      s.id !== 'HOME',
  );

  return (
    <section
      aria-label="Engineer Profile"
      className="fixed inset-0 z-20 pointer-events-none flex items-center"
    >
      <div className="max-w-[1440px] w-full mx-auto px-5 sm:px-8 pt-16 pb-12">
        <div
          className="pointer-events-auto max-w-[520px] rounded-xl p-7 sm:p-8 border border-slate-400/20 shadow-2xl"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          <div className="font-mono-tech text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-slate-200">{ENGINEER_PROFILE.title}</span>
            <span aria-hidden="true">·</span>
            <span>{ENGINEER_PROFILE.location}</span>
          </div>

          <h1 className="mt-3 font-heading text-2xl sm:text-[34px] font-semibold tracking-tight text-[#F8FAFC] leading-[1.2] text-balance">
            {ENGINEER_PROFILE.name}
          </h1>

          <p className="mt-4 text-[15px] leading-[1.6] text-slate-300">
            {ENGINEER_PROFILE.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartJourney}
              onMouseEnter={() => onHoverStation('SKILLS')}
              onMouseLeave={() => onHoverStation(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EA580C] hover:bg-orange-500 text-white text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 whitespace-nowrap shrink-0"
            >
              <span>Start Journey</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onSelectStation('PROJECTS')}
              onMouseEnter={() => onHoverStation('PROJECTS')}
              onMouseLeave={() => onHoverStation(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              View Projects
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="font-mono-tech text-[11px] text-slate-400 mb-2.5">
              Direct station access
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {quickStations.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  onMouseEnter={() => onHoverStation(st.id)}
                  onMouseLeave={() => onHoverStation(null)}
                  className="text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer underline decoration-slate-700 underline-offset-4 hover:decoration-slate-400 whitespace-nowrap"
                >
                  {st.label}
                  <span className="font-mono-tech text-slate-500 ml-1">
                    ({st.podCount})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
