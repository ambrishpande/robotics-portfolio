import React from 'react';
import type { KinematicsTelemetry } from '../three/RoboticsStageEngine';

interface LiveKinematicsStripProps {
  telemetry: KinematicsTelemetry;
}

function fmtDeg(val: number): string {
  const rounded = Math.round(val * 10) / 10;
  return `${rounded >= 0 ? '+' : ''}${rounded.toFixed(1)}°`;
}

function fmtCoord(val: number): string {
  return `${val >= 0 ? '+' : ''}${val.toFixed(2)}m`;
}

export const LiveKinematicsStrip: React.FC<LiveKinematicsStripProps> = ({
  telemetry,
}) => {
  const { angles, tcp, systemState } = telemetry;

  return (
    <div
      aria-label="Live Robot Kinematics Strip"
      className="fixed bottom-0 left-0 right-0 z-25 border-t border-slate-800/90 bg-[#0B101B]/94 px-4 sm:px-8 h-9 flex items-center justify-between gap-4 font-mono-tech text-[11px] text-slate-400 overflow-x-auto robotics-scroll"
    >
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <span className="text-slate-200 font-medium">{systemState}</span>
        <span aria-hidden="true" className="text-slate-700">
          |
        </span>
        <span>
          J1 <span className="text-slate-200">{fmtDeg(angles.j1)}</span>
        </span>
        <span>
          J2 <span className="text-slate-200">{fmtDeg(angles.j2)}</span>
        </span>
        <span>
          J3 <span className="text-slate-200">{fmtDeg(angles.j3)}</span>
        </span>
        <span>
          J4 <span className="text-slate-200">{fmtDeg(angles.j4)}</span>
        </span>
        <span>
          J5 <span className="text-slate-200">{fmtDeg(angles.j5)}</span>
        </span>
        <span>
          J6 <span className="text-slate-200">{fmtDeg(angles.j6)}</span>
        </span>
      </div>

      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <span>
          TCP X <span className="text-blue-400">{fmtCoord(tcp.x)}</span>
        </span>
        <span>
          Y <span className="text-blue-400">{fmtCoord(tcp.y)}</span>
        </span>
        <span>
          Z <span className="text-blue-400">{fmtCoord(tcp.z)}</span>
        </span>
        <span aria-hidden="true" className="text-slate-700">
          |
        </span>
        <span>
          GRIP <span className="text-orange-400">{Math.round(angles.gripper)}%</span>
        </span>
      </div>
    </div>
  );
};
