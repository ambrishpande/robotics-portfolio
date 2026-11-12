import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Home,
  LayoutGrid,
  Mail,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Sliders,
  X,
} from 'lucide-react';
import {
  STATIONS,
  STATION_PODS,
  type DataPod,
  type StationId,
} from '../data/portfolioData';
import type { JointAnglesDeg } from '../three/models';
import type {
  ArmChoreoPhase,
  KinematicsTelemetry,
} from '../three/RoboticsStageEngine';

interface Stage3ReadingZoneProps {
  station: Exclude<StationId, 'HOME'>;
  podIndex: number;
  armPhase: ArmChoreoPhase;
  isPinned: boolean;
  showAllGrid: boolean;
  teleopMode: boolean;
  manualAngles: JointAnglesDeg;
  telemetry: KinematicsTelemetry;
  onTogglePin: () => void;
  onPrevPod: () => void;
  onNextPod: () => void;
  onJumpToPod: (index: number) => void;
  onToggleGrid: () => void;
  onToggleTeleop: (enabled: boolean) => void;
  onChangeManualAngles: (angles: JointAnglesDeg) => void;
  onResetManualPose: () => void;
  onReturnHome: () => void;
  onSelectStation: (station: Exclude<StationId, 'HOME'>) => void;
}

const JOINT_SPECS: {
  key: keyof Omit<JointAnglesDeg, 'gripper'>;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: 'j1', label: 'J1 · Base Waist Yaw', min: -160, max: 160 },
  { key: 'j2', label: 'J2 · Shoulder Pitch', min: -75, max: 75 },
  { key: 'j3', label: 'J3 · Elbow Pitch', min: 10, max: 145 },
  { key: 'j4', label: 'J4 · Forearm Roll', min: -180, max: 180 },
  { key: 'j5', label: 'J5 · Wrist Pitch', min: -135, max: 135 },
  { key: 'j6', label: 'J6 · Tool Flange Roll', min: -180, max: 180 },
];

export const Stage3ReadingZone: React.FC<Stage3ReadingZoneProps> = ({
  station,
  podIndex,
  armPhase,
  isPinned,
  showAllGrid,
  teleopMode,
  manualAngles,
  telemetry,
  onTogglePin,
  onPrevPod,
  onNextPod,
  onJumpToPod,
  onToggleGrid,
  onToggleTeleop,
  onChangeManualAngles,
  onResetManualPose,
  onReturnHome,
  onSelectStation,
}) => {
  const pods = STATION_PODS[station];
  const pod: DataPod = pods[podIndex] ?? pods[0];
  const stationMeta = STATIONS.find((s) => s.id === station) ?? STATIONS[1];
  const isStabilized = armPhase === 'HOLD_MONITOR';

  const [progress, setProgress] = useState(0);
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);

  useEffect(() => {
    setProgress(0);
  }, [station, podIndex, armPhase]);

  useEffect(() => {
    if (!isStabilized || isPinned || showAllGrid || teleopMode) {
      return;
    }

    const duration = pod.readingDurationMs;
    let rafId = 0;
    let lastStamp = performance.now();
    let elapsedMs = 0;

    const step = (now: number) => {
      const delta = now - lastStamp;
      lastStamp = now;
      elapsedMs += delta;
      const ratio = Math.min(1, elapsedMs / duration);
      setProgress(ratio);

      if (ratio >= 1) {
        onNextPod();
        return;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [
    isStabilized,
    isPinned,
    showAllGrid,
    teleopMode,
    pod.id,
    pod.readingDurationMs,
    onNextPod,
  ]);

  const handleCopy = async (text: string, field: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Clipboard fallback ignored safely
    }
  };

  const remainingSeconds = Math.max(
    0,
    ((1 - progress) * pod.readingDurationMs) / 1000,
  ).toFixed(1);

  const armStatusText =
    armPhase === 'APPROACH_PICK'
      ? 'Approaching transfer conveyor'
      : armPhase === 'GRIP_CLOSE'
        ? 'Closing parallel gripper'
        : armPhase === 'TRANSIT_TO_PLINTH'
          ? 'Transferring module to plinth'
          : armPhase === 'PLACE_POD'
            ? 'Positioning module'
            : 'Stabilized';

  const otherStations = STATIONS.filter(
    (s): s is (typeof STATIONS)[number] & { id: Exclude<StationId, 'HOME'> } =>
      s.id !== 'HOME',
  );

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between pt-24 sm:pt-20 pb-12 px-5 sm:px-8">
      {/* Right-aligned Architectural Reading Panel / Manual Teleop Panel */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex items-center justify-end min-h-0">
        {!showAllGrid && (
          <div className="pointer-events-auto w-full lg:w-[540px] xl:w-[570px] max-h-full flex flex-col">
            {teleopMode ? (
              <section
                aria-label="Manual Teleop Joint Control"
                className="rounded-xl border border-slate-400/20 overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-215px)]"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
              >
                <div className="p-6 sm:p-7 overflow-y-auto robotics-scroll">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-mono-tech text-xs text-orange-400">
                        MANUAL TELEOP · FK JOGGER
                      </div>
                      <h2 className="mt-1 text-lg sm:text-xl font-semibold text-[#F8FAFC]">
                        6-DOF Joint &amp; Gripper Control
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={onResetManualPose}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Reset Pose</span>
                    </button>
                  </div>

                  {/* Live TCP Coordinate Readout */}
                  <div className="mt-4 grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono-tech text-xs">
                    <div>
                      <span className="text-slate-500">TCP X </span>
                      <span className="text-blue-400">
                        {telemetry.tcp.x >= 0 ? '+' : ''}
                        {telemetry.tcp.x.toFixed(3)}m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">TCP Y </span>
                      <span className="text-blue-400">
                        {telemetry.tcp.y >= 0 ? '+' : ''}
                        {telemetry.tcp.y.toFixed(3)}m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">TCP Z </span>
                      <span className="text-blue-400">
                        {telemetry.tcp.z >= 0 ? '+' : ''}
                        {telemetry.tcp.z.toFixed(3)}m
                      </span>
                    </div>
                  </div>

                  {/* 6 Joint Sliders */}
                  <div className="mt-5 space-y-3.5">
                    {JOINT_SPECS.map((joint) => {
                      const val = Math.round(manualAngles[joint.key]);
                      return (
                        <div key={joint.key}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-300 font-medium">
                              {joint.label}
                            </span>
                            <span className="font-mono-tech text-slate-200">
                              {val >= 0 ? '+' : ''}
                              {val}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min={joint.min}
                            max={joint.max}
                            step={1}
                            value={val}
                            onChange={(e) =>
                              onChangeManualAngles({
                                ...manualAngles,
                                [joint.key]: Number(e.target.value),
                              })
                            }
                            aria-label={joint.label}
                            className="w-full accent-blue-500 cursor-pointer"
                          />
                        </div>
                      );
                    })}

                    {/* Parallel Gripper Jaw Slider */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">
                          Parallel Gripper Aperture
                        </span>
                        <span className="font-mono-tech text-orange-400">
                          {Math.round(manualAngles.gripper)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={Math.round(manualAngles.gripper)}
                        onChange={(e) =>
                          onChangeManualAngles({
                            ...manualAngles,
                            gripper: Number(e.target.value),
                          })
                        }
                        aria-label="Parallel Gripper Aperture"
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : !isStabilized ? (
              <div
                className="ml-auto w-full sm:w-[440px] rounded-xl p-6 sm:p-7 border border-slate-400/20 shadow-2xl"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
              >
                <div className="flex items-center justify-between font-mono-tech text-xs text-slate-400">
                  <span>{stationMeta.label}</span>
                  <span>{pod.indexLabel}</span>
                </div>
                <div className="mt-3 text-base font-semibold text-[#F8FAFC]">
                  {armStatusText}
                </div>
                <p className="mt-2 text-sm text-slate-400 leading-[1.6]">
                  Loading {pod.title} for stabilized review.
                </p>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full w-2/3 rounded-full transition-all duration-300"
                    style={{ backgroundColor: stationMeta.accentHex }}
                  />
                </div>
              </div>
            ) : (
              <article
                aria-live="polite"
                className="rounded-xl border border-slate-400/20 overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-215px)]"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
              >
                <div className="h-[3px] w-full bg-slate-900 shrink-0">
                  <div
                    className="h-full transition-none"
                    style={{
                      width: `${isPinned ? 100 : progress * 100}%`,
                      backgroundColor: stationMeta.accentHex,
                    }}
                  />
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto robotics-scroll">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tech text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className="font-medium"
                        style={{ color: stationMeta.accentHex }}
                      >
                        {stationMeta.label}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{pod.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300">{pod.indexLabel}</span>
                    </div>
                    <div className="text-slate-400">
                      {isPinned ? 'Pinned' : `${remainingSeconds}s`}
                    </div>
                  </div>

                  <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-[#F8FAFC] leading-snug text-balance">
                    {pod.title}
                  </h2>

                  {(pod.subtitle || pod.timeframe || pod.location) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-300">
                      {pod.subtitle && (
                        <span className="font-medium text-[#F8FAFC]">
                          {pod.subtitle}
                        </span>
                      )}
                      {pod.timeframe && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">
                            ·
                          </span>
                          <span className="font-mono-tech text-xs text-slate-400">
                            {pod.timeframe}
                          </span>
                        </>
                      )}
                      {pod.location && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">
                            ·
                          </span>
                          <span className="font-mono-tech text-xs text-slate-400">
                            {pod.location}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <p className="mt-4 text-[15px] leading-[1.6] text-slate-300">
                    {pod.summary}
                  </p>

                  <ul className="mt-5 space-y-2.5 border-t border-slate-800/90 pt-4 text-left">
                    {pod.highlights.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-200 leading-[1.6]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[9px] w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: stationMeta.accentHex }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {pod.contactAction && (
                    <div className="mt-6 pt-4 border-t border-slate-800/90 flex flex-wrap items-center gap-2.5">
                      <a
                        href={`mailto:${pod.contactAction.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Send Email</span>
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(pod.contactAction!.email, 'email')
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        )}
                        <span>
                          {copiedField === 'email' ? 'Copied' : 'Copy Email'}
                        </span>
                      </button>

                      <a
                        href={`tel:${pod.contactAction.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono-tech text-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        <span>{pod.contactAction.phone}</span>
                      </a>

                      <a
                        href={pod.contactAction.resumePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        <span>Resume PDF</span>
                      </a>
                    </div>
                  )}

                  {pod.tags && pod.tags.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-800/70 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tech text-xs text-slate-400">
                      {pod.tags.map((tag, i) => (
                        <React.Fragment key={tag}>
                          {i > 0 && <span aria-hidden="true">·</span>}
                          <span>{tag}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>
        )}
      </div>

      {/* Stage 3 Control Dock: Auto Demo vs Manual Teleop + Pod Stepper */}
      <div className="pointer-events-auto max-w-[1080px] w-full mx-auto">
        <div
          className="border border-slate-400/20 rounded-xl px-3.5 py-2 shadow-2xl flex flex-wrap items-center justify-between gap-2"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          {/* Auto Demo vs Manual Teleop Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <button
              type="button"
              onClick={() => onToggleTeleop(false)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                !teleopMode
                  ? 'bg-[#2563EB] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto Demo
            </button>
            <button
              type="button"
              onClick={() => onToggleTeleop(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                teleopMode
                  ? 'bg-[#EA580C] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3" aria-hidden="true" />
              <span>Manual Teleop</span>
            </button>
          </div>

          {/* Pod Stepper Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevPod}
              aria-label="Previous module"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Prev</span>
            </button>

            {!teleopMode && (
              <button
                type="button"
                onClick={onTogglePin}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isPinned
                    ? 'bg-orange-600/20 border-orange-500/60 text-orange-200'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                {isPinned ? (
                  <>
                    <Play className="w-3 h-3" aria-hidden="true" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3" aria-hidden="true" />
                    <span>Pause / Pin</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onNextPod}
              aria-label="Next module"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Pod Dots */}
          <div className="hidden lg:flex items-center gap-1.5">
            {pods.map((p, idx) => {
              const active = idx === podIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onJumpToPod(idx)}
                  aria-label={`Select module ${idx + 1}: ${p.title}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    active ? 'w-5' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                  style={active ? { backgroundColor: stationMeta.accentHex } : undefined}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleGrid}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                showAllGrid
                  ? 'bg-blue-600/25 border-blue-500/60 text-blue-100'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View All ({pods.length})</span>
            </button>

            <button
              type="button"
              onClick={onReturnHome}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Facility</span>
            </button>
          </div>
        </div>
      </div>

      {/* View All Cards Architectural Grid Overlay */}
      {showAllGrid && (
        <div
          role="dialog"
          aria-label={`${stationMeta.label} — All Modules`}
          className="fixed inset-0 z-40 bg-[#0B101B]/95 pointer-events-auto flex flex-col pt-20 pb-12 px-5 sm:px-8"
        >
          <div className="max-w-[1320px] w-full mx-auto flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="font-mono-tech text-xs text-slate-400">
                {stationMeta.label} · {stationMeta.gateTitle}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F8FAFC] mt-0.5">
                All {stationMeta.label} Modules ({pods.length})
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {otherStations.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    st.id === station
                      ? 'bg-slate-800 text-[#F8FAFC]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}

              <button
                type="button"
                onClick={onToggleGrid}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>Close</span>
              </button>
            </div>
          </div>

          <div className="max-w-[1320px] w-full mx-auto flex-1 overflow-y-auto robotics-scroll pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
              {pods.map((item, idx) => {
                const isSelected = idx === podIndex;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-6 flex flex-col justify-between transition-colors ${
                      isSelected
                        ? 'border-blue-500/70'
                        : 'border-slate-400/20 hover:border-slate-400/35'
                    }`}
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono-tech text-xs text-slate-400">
                        <span>{item.category}</span>
                        <span>{item.indexLabel}</span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-[#F8FAFC] leading-snug">
                        {item.title}
                      </h3>
                      {(item.subtitle || item.timeframe) && (
                        <div className="mt-1 text-xs text-slate-300">
                          {item.subtitle}
                          {item.timeframe && (
                            <span className="font-mono-tech text-slate-400">
                              {' '}
                              · {item.timeframe}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="mt-3 text-sm text-slate-300 leading-[1.6]">
                        {item.summary}
                      </p>
                      <ul className="mt-3.5 space-y-2 border-t border-slate-800/80 pt-3.5 text-left">
                        {item.highlights.map((h, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-300 leading-[1.55] flex items-start gap-2.5"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                              style={{ backgroundColor: stationMeta.accentHex }}
                            />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="font-mono-tech text-[11px] text-slate-400 truncate">
                        {item.tags?.join(' · ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onJumpToPod(idx);
                          onToggleGrid();
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer shrink-0"
                      >
                        Load on Arm
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
