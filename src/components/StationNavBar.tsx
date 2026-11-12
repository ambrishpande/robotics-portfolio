import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import {
  ENGINEER_PROFILE,
  STATIONS,
  type StationId,
} from '../data/portfolioData';

interface StationNavBarProps {
  activeStation: StationId;
  hoveredStation: StationId | null;
  onSelectStation: (station: StationId) => void;
  onHoverStation: (station: StationId | null) => void;
  onOpenExecutiveView: () => void;
}

export const StationNavBar: React.FC<StationNavBarProps> = ({
  activeStation,
  hoveredStation,
  onSelectStation,
  onHoverStation,
  onOpenExecutiveView,
}) => {
  const focusStation = hoveredStation ?? activeStation;
  const focusIndex = Math.max(
    0,
    STATIONS.findIndex((s) => s.id === focusStation),
  );
  const focusMeta = STATIONS[focusIndex] ?? STATIONS[0];
  const roverLeftPct = (focusIndex / (STATIONS.length - 1)) * 100;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#0B101B]/94 border-b border-slate-800">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onSelectStation('HOME');
          }}
          className="text-base font-semibold tracking-tight text-[#F8FAFC] hover:text-slate-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
        >
          Ambrish Pande
        </a>

        {/* Zone 2: Hash-Routed Station Road & 6-Wheel Rover Guide Rail */}
        <nav
          aria-label="Robotics Station Navigation"
          className="hidden lg:flex flex-col justify-center flex-1 max-w-xl"
        >
          <div className="flex items-center justify-between gap-2">
            {STATIONS.map((station) => {
              const isActive = activeStation === station.id;
              const isHovered = hoveredStation === station.id;
              return (
                <a
                  key={station.id}
                  href={station.hash}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectStation(station.id);
                  }}
                  onMouseEnter={() => onHoverStation(station.id)}
                  onMouseLeave={() => onHoverStation(null)}
                  onFocus={() => onHoverStation(station.id)}
                  onBlur={() => onHoverStation(null)}
                  className={`px-2 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-500 rounded ${
                    isActive
                      ? 'text-[#F8FAFC]'
                      : isHovered
                        ? 'text-slate-200'
                        : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {station.label}
                </a>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            className="relative mt-1.5 h-[2px] mx-4 bg-slate-800"
          >
            <div
              className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
              style={{
                width: `${roverLeftPct}%`,
                backgroundColor: focusMeta.accentHex,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-1.5 rounded-[2px] bg-[#F8FAFC] border transition-all duration-300 ease-out"
              style={{
                left: `${roverLeftPct}%`,
                borderColor: focusMeta.accentHex,
              }}
            />
          </div>
        </nav>

        {/* Zone 3: Utility Bar (Executive View + Download CV) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenExecutiveView}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="hidden sm:inline">Executive View</span>
            <span className="sm:hidden">CV View</span>
          </button>

          <a
            href={ENGINEER_PROFILE.resumePdfUrl}
            download="Ambrish_Pande_Robotics_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-500 text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download CV</span>
          </a>
        </div>
      </div>

      {/* Mobile / Tablet Navigation Row */}
      <nav
        aria-label="Mobile Station Navigation"
        className="flex lg:hidden items-center gap-2 overflow-x-auto px-4 pb-2.5 pt-1 border-t border-slate-800/70"
      >
        {STATIONS.map((station) => {
          const isActive = activeStation === station.id;
          return (
            <a
              key={station.id}
              href={station.hash}
              onClick={(e) => {
                e.preventDefault();
                onSelectStation(station.id);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-800 text-[#F8FAFC]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {station.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
};
