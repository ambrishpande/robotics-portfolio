import { useCallback, useEffect, useRef, useState } from 'react';
import {
  STATION_PODS,
  hashFromStation,
  stationFromHash,
  type StationId,
} from './data/portfolioData';
import type { JointAnglesDeg } from './three/models';
import {
  RoboticsStageEngine,
  type ArmChoreoPhase,
  type ExperienceStage,
  type KinematicsTelemetry,
} from './three/RoboticsStageEngine';
import { StationNavBar } from './components/StationNavBar';
import { HomeHeroOverlay } from './components/HomeHeroOverlay';
import { Stage2TransitionHud } from './components/Stage2TransitionHud';
import { Stage3ReadingZone } from './components/Stage3ReadingZone';
import { LiveKinematicsStrip } from './components/LiveKinematicsStrip';
import { ExecutiveViewModal } from './components/ExecutiveViewModal';

const DEFAULT_TELEOP_ANGLES: JointAnglesDeg = {
  j1: 68,
  j2: 26,
  j3: 72,
  j4: 0,
  j5: -98,
  j6: 0,
  gripper: 85,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<RoboticsStageEngine | null>(null);

  const initialStation = stationFromHash(window.location.hash);

  const [stage, setStage] = useState<ExperienceStage>(
    initialStation === 'HOME' ? 'HOME' : 'STATION',
  );
  const [activeStation, setActiveStation] = useState<StationId>(initialStation);
  const [transitionTarget, setTransitionTarget] =
    useState<Exclude<StationId, 'HOME'>>(
      initialStation === 'HOME' ? 'SKILLS' : initialStation,
    );
  const [hoveredStation, setHoveredStation] = useState<StationId | null>(null);

  const [podIndex, setPodIndex] = useState(0);
  const [armPhase, setArmPhase] = useState<ArmChoreoPhase>('IDLE');
  const [isPinned, setIsPinned] = useState(false);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);

  const [teleopMode, setTeleopMode] = useState(false);
  const [manualAngles, setManualAngles] =
    useState<JointAnglesDeg>(DEFAULT_TELEOP_ANGLES);
  const [telemetry, setTelemetry] = useState<KinematicsTelemetry>({
    angles: DEFAULT_TELEOP_ANGLES,
    tcp: { x: 0, y: 0.04, z: 0.72 },
    systemState: 'ROVER_STANDBY',
  });
  const [webglError, setWebglError] = useState<string | null>(null);

  const activeStationRef = useRef<StationId>(activeStation);
  activeStationRef.current = activeStation;

  // Mount Three.js engine once
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const startStation = stationFromHash(window.location.hash);
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#home');
    }

    const engine = new RoboticsStageEngine(mountEl, {
      onTransitionComplete: (station) => {
        setStage('STATION');
        setActiveStation(station);
        setPodIndex(0);
        setShowAllGrid(false);
        setTeleopMode(false);
      },
      onPodStabilized: (stabilizedIdx) => {
        setPodIndex(stabilizedIdx);
      },
      onArmPhaseChange: (phase) => {
        setArmPhase(phase);
      },
      onTelemetryUpdate: (snapshot) => {
        setTelemetry(snapshot);
      },
      onWebglError: (msg) => {
        setWebglError(msg);
      },
    });

    engineRef.current = engine;
    void engine.init(startStation);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const navigateToStation = useCallback(
    (station: StationId, pushHash = true) => {
      setShowAllGrid(false);
      setIsPinned(false);
      setTeleopMode(false);

      if (pushHash) {
        const nextHash = hashFromStation(station);
        if (window.location.hash !== nextHash) {
          window.location.hash = nextHash;
        }
      }

      if (station === 'HOME') {
        setStage('HOME');
        setActiveStation('HOME');
        setArmPhase('IDLE');
        engineRef.current?.goHome();
        return;
      }

      setTransitionTarget(station);
      setActiveStation(station);
      setStage('TRANSITION');
      setPodIndex(0);
      engineRef.current?.startStationTransition(station);
    },
    [],
  );

  // Listen to browser Back/Forward hash navigation
  useEffect(() => {
    const onHashChange = () => {
      const target = stationFromHash(window.location.hash);
      if (target !== activeStationRef.current) {
        navigateToStation(target, false);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [navigateToStation]);

  const handleHoverStation = useCallback((station: StationId | null) => {
    setHoveredStation(station);
    engineRef.current?.setHoveredStation(station);
  }, []);

  const handleStartJourney = useCallback(() => {
    navigateToStation('SKILLS');
  }, [navigateToStation]);

  const handleSkipIntro = useCallback(() => {
    engineRef.current?.skipTransition();
  }, []);

  const handleJumpToPod = useCallback(
    (nextIdx: number) => {
      if (activeStation === 'HOME') return;
      const pods = STATION_PODS[activeStation];
      const wrapped = ((nextIdx % pods.length) + pods.length) % pods.length;
      setPodIndex(wrapped);
      setTeleopMode(false);
      engineRef.current?.triggerPodPick(wrapped);
    },
    [activeStation],
  );

  const handleNextPod = useCallback(() => {
    handleJumpToPod(podIndex + 1);
  }, [handleJumpToPod, podIndex]);

  const handlePrevPod = useCallback(() => {
    handleJumpToPod(podIndex - 1);
  }, [handleJumpToPod, podIndex]);

  const handleTogglePin = useCallback(() => {
    setIsPinned((prev) => !prev);
  }, []);

  const handleToggleGrid = useCallback(() => {
    setShowAllGrid((prev) => !prev);
  }, []);

  const handleToggleTeleop = useCallback((enabled: boolean) => {
    setTeleopMode(enabled);
    if (engineRef.current) {
      const seeded = engineRef.current.setTeleopMode(enabled);
      setManualAngles(seeded);
    }
  }, []);

  const handleChangeManualAngles = useCallback((nextAngles: JointAnglesDeg) => {
    setManualAngles(nextAngles);
    engineRef.current?.setManualJointAngles(nextAngles);
  }, []);

  const handleResetManualPose = useCallback(() => {
    setManualAngles(DEFAULT_TELEOP_ANGLES);
    engineRef.current?.setManualJointAngles(DEFAULT_TELEOP_ANGLES);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showExecutiveModal && e.key === 'Escape') {
        setShowExecutiveModal(false);
        return;
      }
      if (stage === 'TRANSITION' && e.key === 'Escape') {
        handleSkipIntro();
      } else if (stage === 'STATION' && !teleopMode) {
        if (e.key === 'ArrowRight') handleNextPod();
        else if (e.key === 'ArrowLeft') handlePrevPod();
        else if (e.key === 'Escape' && showAllGrid) setShowAllGrid(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    stage,
    teleopMode,
    showAllGrid,
    showExecutiveModal,
    handleSkipIntro,
    handleNextPod,
    handlePrevPod,
  ]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0B101B] text-[#F8FAFC] select-none">
      {/* Isolated WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full z-0"
        aria-hidden="true"
      />

      {/* Top Navigation & Utility Bar */}
      <StationNavBar
        activeStation={activeStation}
        hoveredStation={hoveredStation}
        onSelectStation={(st) => navigateToStation(st)}
        onHoverStation={handleHoverStation}
        onOpenExecutiveView={() => setShowExecutiveModal(true)}
      />

      {webglError && (
        <div className="fixed inset-x-0 top-24 z-40 flex justify-center px-4">
          <div className="bg-[#0F172A] border border-orange-500/50 rounded-xl px-5 py-3 text-xs text-slate-200 max-w-lg shadow-xl">
            3D Viewport notice: {webglError}. You can still browse all stations or open the Executive View above.
          </div>
        </div>
      )}

      {/* Stage 1: Home Hero Overlay */}
      {stage === 'HOME' && (
        <HomeHeroOverlay
          onStartJourney={handleStartJourney}
          onSelectStation={(st) => navigateToStation(st)}
          onHoverStation={handleHoverStation}
        />
      )}

      {/* Stage 2: Humanoid Gate Transition HUD */}
      {stage === 'TRANSITION' && (
        <Stage2TransitionHud
          targetStation={transitionTarget}
          onSkipIntro={handleSkipIntro}
        />
      )}

      {/* Stage 3: 6-DOF Arm Cleanroom Presenter & Manual Teleop */}
      {stage === 'STATION' && activeStation !== 'HOME' && (
        <Stage3ReadingZone
          station={activeStation}
          podIndex={podIndex}
          armPhase={armPhase}
          isPinned={isPinned}
          showAllGrid={showAllGrid}
          teleopMode={teleopMode}
          manualAngles={manualAngles}
          telemetry={telemetry}
          onTogglePin={handleTogglePin}
          onPrevPod={handlePrevPod}
          onNextPod={handleNextPod}
          onJumpToPod={handleJumpToPod}
          onToggleGrid={handleToggleGrid}
          onToggleTeleop={handleToggleTeleop}
          onChangeManualAngles={handleChangeManualAngles}
          onResetManualPose={handleResetManualPose}
          onReturnHome={() => navigateToStation('HOME')}
          onSelectStation={(st) => navigateToStation(st)}
        />
      )}

      {/* Bottom Live Kinematics Telemetry Strip */}
      <LiveKinematicsStrip telemetry={telemetry} />

      {/* All-in-One Executive View Modal */}
      <ExecutiveViewModal
        open={showExecutiveModal}
        onClose={() => setShowExecutiveModal(false)}
        onJumpToStation={(st) => navigateToStation(st)}
      />
    </main>
  );
}
