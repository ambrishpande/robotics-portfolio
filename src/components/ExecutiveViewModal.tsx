import React from 'react';
import { Download, Mail, MapPin, Phone, X } from 'lucide-react';
import {
  ENGINEER_PROFILE,
  STATION_PODS,
  type StationId,
} from '../data/portfolioData';

interface ExecutiveViewModalProps {
  open: boolean;
  onClose: () => void;
  onJumpToStation: (station: Exclude<StationId, 'HOME'>) => void;
}

export const ExecutiveViewModal: React.FC<ExecutiveViewModalProps> = ({
  open,
  onClose,
  onJumpToStation,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Executive Resume Overview"
      className="fixed inset-0 z-50 bg-[#0B101B]/95 flex flex-col pt-6 pb-6 px-4 sm:px-8"
    >
      <div className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#F8FAFC]">
            {ENGINEER_PROFILE.name}
          </h2>
          <div className="mt-1 font-mono-tech text-xs text-slate-400 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-slate-200">{ENGINEER_PROFILE.title}</span>
            <span aria-hidden="true">·</span>
            <span>{ENGINEER_PROFILE.location}</span>
            <span aria-hidden="true">·</span>
            <span>{ENGINEER_PROFILE.email}</span>
            <span aria-hidden="true">·</span>
            <span>{ENGINEER_PROFILE.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={ENGINEER_PROFILE.resumePdfUrl}
            download="Ambrish_Pande_Robotics_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download CV</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Executive View"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Close</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto flex-1 overflow-y-auto robotics-scroll pt-6 space-y-8 pb-8">
        {/* Executive Profile */}
        <section>
          <h3 className="font-mono-tech text-xs uppercase tracking-wider text-slate-400 mb-2">
            Profile Summary
          </h3>
          <p className="text-sm sm:text-[15px] leading-[1.6] text-slate-200">
            {ENGINEER_PROFILE.summary}
          </p>
        </section>

        {/* Skills */}
        <section className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono-tech text-xs uppercase tracking-wider text-slate-400">
              Technical Skills &amp; Core Domains
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                onJumpToStation('SKILLS');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Inspect in 3D Station
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STATION_PODS.SKILLS.map((pod) => (
              <div
                key={pod.id}
                className="rounded-xl p-4 border border-slate-400/15 bg-slate-900/60"
              >
                <div className="font-mono-tech text-[11px] text-blue-400">
                  {pod.category}
                </div>
                <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">
                  {pod.title}
                </div>
                <ul className="mt-2.5 space-y-1">
                  {pod.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-[1.55]">
                      • {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Work Experience */}
        <section className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono-tech text-xs uppercase tracking-wider text-slate-400">
              Work Experience
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                onJumpToStation('EXPERIENCE');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Inspect in 3D Station
            </button>
          </div>
          <div className="space-y-4">
            {STATION_PODS.EXPERIENCE.map((pod) => (
              <div
                key={pod.id}
                className="rounded-xl p-5 border border-slate-400/15 bg-slate-900/60"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-base font-semibold text-[#F8FAFC]">
                      {pod.title}
                    </span>
                    <span className="text-slate-500 mx-2">·</span>
                    <span className="text-sm text-slate-300">{pod.subtitle}</span>
                  </div>
                  <span className="font-mono-tech text-xs text-slate-400">
                    {pod.timeframe} · {pod.location}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {pod.highlights.map((h, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-300 leading-[1.6]">
                      • {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Certifications */}
        <section className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono-tech text-xs uppercase tracking-wider text-slate-400">
              Education &amp; Certifications
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                onJumpToStation('EDUCATION');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Inspect in 3D Station
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATION_PODS.EDUCATION.map((pod) => (
              <div
                key={pod.id}
                className="rounded-xl p-4 border border-slate-400/15 bg-slate-900/60"
              >
                <div className="font-mono-tech text-[11px] text-orange-400">
                  {pod.timeframe}
                </div>
                <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">
                  {pod.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">{pod.subtitle}</div>
                <ul className="mt-2.5 space-y-1">
                  {pod.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-[1.5]">
                      • {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Key Projects */}
        <section className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono-tech text-xs uppercase tracking-wider text-slate-400">
              Key Robotics &amp; Engineering Projects ({STATION_PODS.PROJECTS.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                onJumpToStation('PROJECTS');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Inspect in 3D Station
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STATION_PODS.PROJECTS.map((pod) => (
              <div
                key={pod.id}
                className="rounded-xl p-4 border border-slate-400/15 bg-slate-900/60"
              >
                <div className="flex items-center justify-between font-mono-tech text-[11px] text-slate-400">
                  <span>{pod.category}</span>
                  <span>{pod.timeframe}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">
                  {pod.title}
                </div>
                <p className="mt-1.5 text-xs text-slate-300 leading-[1.55]">
                  {pod.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Strip */}
        <section className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-300">
          <a
            href={`mailto:${ENGINEER_PROFILE.email}`}
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            <span>{ENGINEER_PROFILE.email}</span>
          </a>
          <a
            href={`tel:${ENGINEER_PROFILE.phone}`}
            className="inline-flex items-center gap-2 font-mono-tech hover:text-white"
          >
            <Phone className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
            <span>{ENGINEER_PROFILE.phone}</span>
          </a>
          <span className="inline-flex items-center gap-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>{ENGINEER_PROFILE.fullLocation}</span>
          </span>
        </section>
      </div>
    </div>
  );
};
