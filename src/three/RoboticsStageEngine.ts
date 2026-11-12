import type * as THREEType from 'three';
import { loadThreeKit } from '../lib/three-loader';
import {
  STATIONS,
  type StationId,
} from '../data/portfolioData';
import {
  createRoboticsMaterials,
  type RoboticsMaterialSet,
} from './materials';
import {
  applySixDofJointAngles,
  buildHumanoidRobot,
  buildRoboticsHighway,
  buildScoutBot,
  buildSixDofCell,
  solveSixDofArmIK,
  type HighwayRig,
  type HumanoidRig,
  type JointAnglesDeg,
  type ScoutBotRig,
  type SixDofArmRig,
} from './models';

export type ExperienceStage = 'HOME' | 'TRANSITION' | 'STATION';

export type ArmChoreoPhase =
  | 'IDLE'
  | 'APPROACH_PICK'
  | 'GRIP_CLOSE'
  | 'TRANSIT_TO_PLINTH'
  | 'PLACE_POD'
  | 'HOLD_MONITOR';

export interface KinematicsTelemetry {
  angles: JointAnglesDeg;
  tcp: { x: number; y: number; z: number };
  systemState: string;
}

export interface EngineCallbacks {
  onTransitionComplete: (station: Exclude<StationId, 'HOME'>) => void;
  onPodStabilized: (podIndex: number) => void;
  onArmPhaseChange: (phase: ArmChoreoPhase) => void;
  onTelemetryUpdate: (telemetry: KinematicsTelemetry) => void;
  onWebglError: (message: string) => void;
}

type TransitionSubPhase = 'WALK' | 'SCAN' | 'PORTAL_DIVE';

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export class RoboticsStageEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private THREE!: typeof THREEType;
  private renderer!: THREEType.WebGLRenderer;
  private scene!: THREEType.Scene;
  private camera!: THREEType.PerspectiveCamera;
  private materials!: RoboticsMaterialSet;

  private highwayRig!: HighwayRig;
  private scoutBot!: ScoutBotRig;
  private humanoid!: HumanoidRig;
  private sixDofRig!: SixDofArmRig;

  private keyLight!: THREEType.DirectionalLight;
  private accentPointLight!: THREEType.PointLight;

  private isSoftwareGl = false;
  private disposed = false;
  private frameId = 0;
  private lastTime = 0;
  private elapsed = 0;
  private lastTelemetryEmit = 0;

  private stage: ExperienceStage = 'HOME';
  private activeStation: StationId = 'HOME';
  private hoveredStation: StationId | null = null;

  private scoutX = -10;
  private scoutVel = 0;

  private transitionTarget: Exclude<StationId, 'HOME'> = 'SKILLS';
  private transitionSubPhase: TransitionSubPhase = 'WALK';
  private transitionTimer = 0;
  private humanoidX = -8.6;
  private walkPhase = 0;

  // Stage 3 Arm State (Auto Demo vs Manual Teleop)
  private armPhase: ArmChoreoPhase = 'IDLE';
  private armTimer = 0;
  private currentPodIndex = 0;
  private effCurrent!: THREEType.Vector3;
  private effStart!: THREEType.Vector3;
  private effTarget!: THREEType.Vector3;
  private gripperOpen = 1;
  private wristRoll = 0;
  private podAttached = false;

  private teleopMode = false;
  private manualTargetAngles: JointAnglesDeg = {
    j1: 68,
    j2: 26,
    j3: 72,
    j4: 0,
    j5: -98,
    j6: 0,
    gripper: 85,
  };
  private manualCurrentAngles: JointAnglesDeg = { ...this.manualTargetAngles };
  private currentAngles: JointAnglesDeg = { ...this.manualTargetAngles };
  private _tcpWorld!: THREEType.Vector3;

  private camCurrentLook!: THREEType.Vector3;
  private camNextLook!: THREEType.Vector3;
  private camNextPos!: THREEType.Vector3;
  private pointerOffsetX = 0;
  private pointerOffsetY = 0;

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
  }

  public async init(initialStation: StationId = 'HOME'): Promise<void> {
    try {
      const { THREE, RoomEnvironment } = await loadThreeKit();
      if (this.disposed) return;

      this.THREE = THREE;
      this.isSoftwareGl = detectSoftwareWebGL();

      this._tcpWorld = new THREE.Vector3();
      this.effCurrent = new THREE.Vector3(-1.9, 1.32, 0.48);
      this.effStart = new THREE.Vector3(-1.9, 1.32, 0.48);
      this.effTarget = new THREE.Vector3(-1.9, 1.32, 0.48);
      this.camCurrentLook = new THREE.Vector3(-3.8, 1.28, 0);
      this.camNextLook = new THREE.Vector3(-3.8, 1.28, 0);
      this.camNextPos = new THREE.Vector3(-5.5, 2.55, 7.7);

      const width = Math.max(1, this.container.clientWidth);
      const height = Math.max(1, this.container.clientHeight);

      this.renderer = new THREE.WebGLRenderer({
        antialias: !this.isSoftwareGl,
        powerPreference: 'high-performance',
      });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      this.renderer.setPixelRatio(
        this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
      );
      this.renderer.setSize(width, height);
      this.renderer.shadowMap.enabled = !this.isSoftwareGl;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.renderer.domElement.style.display = 'block';
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.container.appendChild(this.renderer.domElement);

      this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
      this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0b101b);
      this.scene.fog = new THREE.FogExp2(0x0b101b, 0.028);

      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      this.camera.position.copy(this.camNextPos);
      this.camera.lookAt(this.camCurrentLook);

      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();

      const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.9);
      this.scene.add(hemiLight);

      this.keyLight = new THREE.DirectionalLight(0xfff8ed, 2.05);
      this.keyLight.position.set(5.5, 10.5, 6.5);
      this.keyLight.castShadow = !this.isSoftwareGl;
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      const d = 14;
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 30;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
      this.scene.add(this.keyLight);

      const rimLight = new THREE.DirectionalLight(0x94a3b8, 0.95);
      rimLight.position.set(-7, 6, -6.5);
      this.scene.add(rimLight);

      this.accentPointLight = new THREE.PointLight(0x2563eb, 1.2, 10, 1.5);
      this.accentPointLight.position.set(0, 3.2, 1.6);
      this.scene.add(this.accentPointLight);

      const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
      this.materials = createRoboticsMaterials(THREE, maxAniso);

      this.highwayRig = buildRoboticsHighway(THREE, this.materials);
      this.scene.add(this.highwayRig.root);

      this.scoutBot = buildScoutBot(THREE, this.materials);
      this.scoutBot.root.position.set(this.scoutX, 0.042, 0.72);
      this.highwayRig.root.add(this.scoutBot.root);

      this.humanoid = buildHumanoidRobot(THREE, this.materials);
      this.humanoid.root.position.set(this.humanoidX, 0.042, -0.15);
      this.humanoid.root.rotation.y = Math.PI * 0.14;
      this.highwayRig.root.add(this.humanoid.root);

      this.sixDofRig = buildSixDofCell(THREE, this.materials);
      this.sixDofRig.root.visible = false;
      this.scene.add(this.sixDofRig.root);

      this.currentAngles = solveSixDofArmIK(this.sixDofRig, this.effCurrent, 0, 1);

      if (!this.isSoftwareGl) {
        this.renderer.compile(this.scene, this.camera);
      }

      window.addEventListener('resize', this.handleResize);
      window.addEventListener('pointermove', this.handlePointerMove);

      if (initialStation !== 'HOME') {
        this.enterCleanroomStation(initialStation);
      }

      this.lastTime = performance.now();
      this.tick();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to initialize 3D WebGL engine.';
      this.callbacks.onWebglError(message);
    }
  }

  public setHoveredStation(stationId: StationId | null): void {
    this.hoveredStation = stationId;
  }

  public goHome(): void {
    this.stage = 'HOME';
    this.activeStation = 'HOME';
    this.teleopMode = false;
    this.highwayRig.root.visible = true;
    this.sixDofRig.root.visible = false;

    this.humanoidX = -8.6;
    this.humanoid.root.position.set(this.humanoidX, 0.042, -0.15);
    this.humanoid.root.rotation.y = Math.PI * 0.14;
    this.resetHumanoidLimbs();

    this.scoutX = -10;
    this.scoutVel = 0;
    this.accentPointLight.color.setHex(0x2563eb);
  }

  public startStationTransition(target: Exclude<StationId, 'HOME'>): void {
    const prevStage = this.stage;
    this.transitionTarget = target;
    this.activeStation = target;
    this.teleopMode = false;
    this.stage = 'TRANSITION';
    this.transitionSubPhase = 'WALK';
    this.transitionTimer = 0;

    this.highwayRig.root.visible = true;
    this.sixDofRig.root.visible = false;

    const gate = this.highwayRig.gates.get(target);
    const targetGateX = gate ? gate.x : -6;

    if (prevStage === 'STATION') {
      this.humanoidX = Math.max(-11.2, targetGateX - 4.0);
    } else if (Math.abs(this.humanoidX - targetGateX) < 1.8) {
      this.humanoidX = Math.max(-11.2, targetGateX - 3.6);
    }
    this.humanoid.root.position.set(this.humanoidX, 0.042, -0.15);

    const stMeta = STATIONS.find((s) => s.id === target);
    if (stMeta) {
      this.accentPointLight.color.setHex(stMeta.accentNumber);
    }
  }

  public skipTransition(): void {
    if (this.stage !== 'TRANSITION') return;
    this.enterCleanroomStation(this.transitionTarget);
  }

  public enterStationImmediate(station: Exclude<StationId, 'HOME'>): void {
    this.enterCleanroomStation(station);
  }

  public setTeleopMode(enabled: boolean): JointAnglesDeg {
    this.teleopMode = enabled;
    if (enabled) {
      // Seed manual sliders seamlessly from the live arm joint pose
      this.manualTargetAngles = { ...this.currentAngles };
      this.manualCurrentAngles = { ...this.currentAngles };
      if (this.podAttached) {
        this.detachPodToPlinth();
      }
    } else {
      // Resume clean hold pose above the reading plinth
      this.armPhase = 'HOLD_MONITOR';
      this.effCurrent.set(
        this.sixDofRig.readingPlinthWorld.x - 0.16,
        this.sixDofRig.readingPlinthWorld.y + 0.42,
        this.sixDofRig.readingPlinthWorld.z - 0.08,
      );
      this.callbacks.onArmPhaseChange('HOLD_MONITOR');
    }
    return { ...this.manualTargetAngles };
  }

  public setManualJointAngles(angles: JointAnglesDeg): void {
    this.manualTargetAngles = { ...angles };
  }

  public triggerPodPick(podIndex: number): void {
    if (this.stage !== 'STATION') return;
    this.teleopMode = false;
    this.currentPodIndex = podIndex;
    this.detachPodToDispenser();
    this.armPhase = 'APPROACH_PICK';
    this.armTimer = 0;
    this.effStart.copy(this.effCurrent);
    this.callbacks.onArmPhaseChange('APPROACH_PICK');
  }

  private enterCleanroomStation(station: Exclude<StationId, 'HOME'>): void {
    this.stage = 'STATION';
    this.activeStation = station;
    this.teleopMode = false;
    this.highwayRig.root.visible = false;
    this.sixDofRig.root.visible = true;

    const stMeta = STATIONS.find((s) => s.id === station);
    const accent = stMeta ? stMeta.accentNumber : 0x2563eb;
    this.accentPointLight.color.setHex(accent);
    this.accentPointLight.position.set(-0.2, 2.9, 1.8);
    this.sixDofRig.activePodAccentMat.color.setHex(accent);
    this.sixDofRig.activePodAccentMat.emissive.setHex(accent);
    this.sixDofRig.plinthRingMat.color.setHex(accent);
    this.sixDofRig.plinthRingMat.emissive.setHex(accent);

    this.camera.position.set(0.45, 2.32, 5.25);
    this.camCurrentLook.set(0.42, 1.12, 0.25);
    this.camera.lookAt(this.camCurrentLook);

    this.currentPodIndex = 0;
    this.detachPodToDispenser();
    this.effCurrent.set(-1.15, 1.65, 0.2);
    this.effStart.copy(this.effCurrent);
    this.armPhase = 'APPROACH_PICK';
    this.armTimer = 0;

    this.callbacks.onArmPhaseChange('APPROACH_PICK');
    this.callbacks.onTransitionComplete(station);
  }

  private detachPodToDispenser(): void {
    const pod = this.sixDofRig.activePod;
    if (pod.parent !== this.sixDofRig.root) {
      this.sixDofRig.root.add(pod);
    }
    pod.position.copy(this.sixDofRig.dispenserSlotWorld);
    pod.rotation.set(0, 0, 0);
    this.podAttached = false;
  }

  private detachPodToPlinth(): void {
    const pod = this.sixDofRig.activePod;
    if (pod.parent !== this.sixDofRig.root) {
      this.sixDofRig.root.add(pod);
    }
    pod.position.copy(this.sixDofRig.readingPlinthWorld);
    pod.rotation.set(0, 0, 0);
    this.podAttached = false;
  }

  private resetHumanoidLimbs(): void {
    const h = this.humanoid;
    h.pelvis.position.set(0, 0.96, 0);
    h.pelvis.rotation.set(0, 0, 0);
    h.spineMid.rotation.set(0, 0, 0);
    h.torso.rotation.set(0, 0, 0);
    h.head.rotation.set(0, 0, 0);
    h.leftShoulder.rotation.set(0, 0, 0);
    h.leftElbow.rotation.set(-0.14, 0, 0);
    h.leftFingers.rotation.set(0, 0, 0);
    h.rightShoulder.rotation.set(0, 0, 0);
    h.rightElbow.rotation.set(-0.14, 0, 0);
    h.rightFingers.rotation.set(0, 0, 0);
    h.leftHip.rotation.set(0, 0, 0);
    h.leftKnee.rotation.set(0, 0, 0);
    h.leftAnkle.rotation.set(0, 0, 0);
    h.rightHip.rotation.set(0, 0, 0);
    h.rightKnee.rotation.set(0, 0, 0);
    h.rightAnkle.rotation.set(0, 0, 0);
  }

  private handlePointerMove = (e: PointerEvent): void => {
    const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    this.pointerOffsetX = nx;
    this.pointerOffsetY = ny;
  };

  private handleResize = (): void => {
    if (!this.renderer || !this.camera || this.disposed) return;
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
  };

  private handleContextRestored = (): void => {
    this.lastTime = performance.now();
    this.tick();
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    } else {
      this.frameId = window.setTimeout(cb, 80);
    }
  }

  private tick = (): void => {
    if (this.disposed) return;

    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.elapsed += dt;

    this.updateScene(dt);
    this.renderer.render(this.scene, this.camera);

    if (now - this.lastTelemetryEmit >= 65) {
      this.lastTelemetryEmit = now;
      this.emitTelemetry();
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private emitTelemetry(): void {
    let tcpX = 0;
    let tcpY = 0;
    let tcpZ = 0;

    if (this.stage === 'STATION') {
      this.sixDofRig.podCarrySlot.getWorldPosition(this._tcpWorld);
      const basePos = this.sixDofRig.j1Waist.position;
      tcpX = this._tcpWorld.x - basePos.x;
      tcpY = this._tcpWorld.y;
      tcpZ = this._tcpWorld.z - basePos.z;
    } else {
      tcpX = this.scoutX;
      tcpY = 0.04;
      tcpZ = 0.72;
    }

    const systemState =
      this.stage === 'HOME'
        ? 'ROVER_STANDBY'
        : this.stage === 'TRANSITION'
          ? 'HUMANOID_GATE_TRANSIT'
          : this.teleopMode
            ? 'MANUAL_TELEOP'
            : this.armPhase === 'HOLD_MONITOR'
              ? 'STABILIZED_HOLD'
              : 'AUTO_PICK_PLACE';

    this.callbacks.onTelemetryUpdate({
      angles: { ...this.currentAngles },
      tcp: { x: tcpX, y: tcpY, z: tcpZ },
      systemState,
    });
  }

  private updateScene(dt: number): void {
    const THREE = this.THREE;

    if (this.stage === 'HOME' || this.stage === 'TRANSITION') {
      this.updateHighwayAndScout(dt);
    }

    if (this.stage === 'HOME') {
      this.updateHumanoidIdle();
      this.camNextPos.set(
        -5.6 + this.pointerOffsetX * 0.32,
        2.52 - this.pointerOffsetY * 0.14,
        7.8,
      );
      this.camNextLook.set(-3.8, 1.25, 0);
    } else if (this.stage === 'TRANSITION') {
      this.updateStage2Transition(dt);
    } else if (this.stage === 'STATION') {
      this.updateStage3Cleanroom(dt);
    }

    const camLambda = this.stage === 'TRANSITION' ? 5.0 : 3.2;
    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      this.camNextPos.x,
      camLambda,
      dt,
    );
    this.camera.position.y = THREE.MathUtils.damp(
      this.camera.position.y,
      this.camNextPos.y,
      camLambda,
      dt,
    );
    this.camera.position.z = THREE.MathUtils.damp(
      this.camera.position.z,
      this.camNextPos.z,
      camLambda,
      dt,
    );

    this.camCurrentLook.x = THREE.MathUtils.damp(
      this.camCurrentLook.x,
      this.camNextLook.x,
      camLambda,
      dt,
    );
    this.camCurrentLook.y = THREE.MathUtils.damp(
      this.camCurrentLook.y,
      this.camNextLook.y,
      camLambda,
      dt,
    );
    this.camCurrentLook.z = THREE.MathUtils.damp(
      this.camCurrentLook.z,
      this.camNextLook.z,
      camLambda,
      dt,
    );

    this.camera.lookAt(this.camCurrentLook);
  }

  private updateHighwayAndScout(dt: number): void {
    const THREE = this.THREE;
    const targetId = this.hoveredStation ?? this.activeStation;
    const targetMeta = STATIONS.find((s) => s.id === targetId) ?? STATIONS[0];

    const prevX = this.scoutX;
    this.scoutX = THREE.MathUtils.damp(this.scoutX, targetMeta.gateX, 4.5, dt);
    this.scoutVel = (this.scoutX - prevX) / dt;

    this.scoutBot.root.position.x = this.scoutX;
    if (Math.abs(this.scoutVel) > 0.04) {
      this.scoutBot.root.rotation.y = this.scoutVel >= 0 ? 0 : Math.PI;
    }

    const wheelDelta = (this.scoutX - prevX) / 0.095;
    const dirSign = this.scoutBot.root.rotation.y === 0 ? 1 : -1;
    for (const w of this.scoutBot.wheels) {
      w.rotation.z -= wheelDelta * dirSign;
    }

    this.scoutBot.lidarHead.rotation.y += dt * 3.5;

    this.scoutBot.sensorMat.color.setHex(targetMeta.accentNumber);
    this.scoutBot.sensorMat.emissive.setHex(targetMeta.accentNumber);

    const beamSpan = Math.abs(targetMeta.gateX - this.scoutX);
    if (this.hoveredStation || beamSpan > 0.15) {
      const len = Math.max(0.6, beamSpan);
      this.highwayRig.sensorBeam.visible = true;
      this.highwayRig.sensorBeam.scale.set(len, 1, 1);
      this.highwayRig.sensorBeam.position.x = (this.scoutX + targetMeta.gateX) * 0.5;
      this.highwayRig.sensorBeamMat.color.setHex(targetMeta.accentNumber);
      this.highwayRig.sensorBeamMat.opacity = this.hoveredStation ? 0.78 : 0.35;
    } else {
      this.highwayRig.sensorBeam.visible = false;
    }

    for (const [id, gate] of this.highwayRig.gates.entries()) {
      const isHighlighted = id === targetId;
      gate.ringMat.emissiveIntensity = THREE.MathUtils.damp(
        gate.ringMat.emissiveIntensity,
        isHighlighted ? 1.15 : 0.32,
        6,
        dt,
      );
    }
  }

  private updateHumanoidIdle(): void {
    const t = this.elapsed;
    const h = this.humanoid;
    h.pelvis.position.y = 0.96;
    h.spineMid.rotation.x = 0.02 + Math.sin(t * 1.1) * 0.008;
    h.head.rotation.y = Math.sin(t * 0.55) * 0.16;
    h.head.rotation.x = 0.02 + Math.sin(t * 0.9) * 0.015;
    h.leftShoulder.rotation.x = 0.05;
    h.leftElbow.rotation.x = -0.22;
    h.rightShoulder.rotation.x = 0.05;
    h.rightElbow.rotation.x = -0.22;
  }

  private updateStage2Transition(dt: number): void {
    const THREE = this.THREE;
    const gate = this.highwayRig.gates.get(this.transitionTarget);
    if (!gate) {
      this.enterCleanroomStation(this.transitionTarget);
      return;
    }

    const h = this.humanoid;
    const stopX = gate.x - 0.75;

    if (this.transitionSubPhase === 'WALK') {
      const dist = stopX - this.humanoidX;
      const dir = dist >= 0 ? 1 : -1;
      const walkSpeed = 4.2;

      if (Math.abs(dist) > 0.08) {
        const step = Math.min(Math.abs(dist), walkSpeed * dt);
        this.humanoidX += dir * step;
        h.root.position.x = this.humanoidX;
        h.root.rotation.y = THREE.MathUtils.damp(
          h.root.rotation.y,
          dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5,
          10,
          dt,
        );

        this.walkPhase += dt * 7.6;
        const s = Math.sin(this.walkPhase);
        const c = Math.cos(this.walkPhase);

        h.pelvis.position.y = 0.942 - Math.abs(c) * 0.024;
        h.pelvis.position.z = s * 0.022;
        h.pelvis.rotation.z = -s * 0.032;
        h.spineMid.rotation.y = -s * 0.055;
        h.torso.rotation.x = 0.065;
        h.head.rotation.y = 0;

        h.leftHip.rotation.x = s * 0.48;
        h.leftKnee.rotation.x = Math.max(0.06, -c * 0.72 + 0.08);
        h.leftAnkle.rotation.x = -h.leftHip.rotation.x * 0.5 - h.leftKnee.rotation.x * 0.25;

        h.rightHip.rotation.x = -s * 0.48;
        h.rightKnee.rotation.x = Math.max(0.06, c * 0.72 + 0.08);
        h.rightAnkle.rotation.x = -h.rightHip.rotation.x * 0.5 - h.rightKnee.rotation.x * 0.25;

        h.leftShoulder.rotation.x = -s * 0.38;
        h.leftElbow.rotation.x = -0.32 - Math.max(0, s) * 0.24;
        h.leftFingers.rotation.z = 0.15;

        h.rightShoulder.rotation.x = s * 0.38;
        h.rightElbow.rotation.x = -0.32 - Math.max(0, -s) * 0.24;
        h.rightFingers.rotation.z = -0.15;

        this.camNextPos.set(this.humanoidX + dir * 1.4, 2.08, 4.85);
        this.camNextLook.set(this.humanoidX + dir * 0.55, 1.24, 0.15);
      } else {
        this.transitionSubPhase = 'SCAN';
        this.transitionTimer = 0;
        this.resetHumanoidLimbs();
      }
    } else if (this.transitionSubPhase === 'SCAN') {
      this.transitionTimer += dt;
      const p = Math.min(1, this.transitionTimer / 0.85);

      h.root.rotation.y = THREE.MathUtils.damp(h.root.rotation.y, 0.28, 8, dt);
      h.head.rotation.y = THREE.MathUtils.damp(h.head.rotation.y, 0.22, 8, dt);

      const raise = Math.sin(Math.min(1, p * 1.4) * (Math.PI * 0.5));
      h.rightShoulder.rotation.x = -1.25 * raise;
      h.rightShoulder.rotation.z = -0.14 * raise;
      h.rightElbow.rotation.x = -0.3 * raise;
      h.rightHandScanMat.emissiveIntensity = 0.9 + p * 0.9;

      if (p > 0.35) {
        const sp = (p - 0.35) / 0.65;
        gate.unlockRing.visible = true;
        gate.unlockRing.scale.setScalar(0.6 + sp * 3.0);
        gate.unlockRingMat.opacity = (1 - sp) * 0.6;
        gate.terminalMat.emissiveIntensity = 1.6;
      }

      this.camNextPos.set(gate.x - 0.25, 1.92, 4.2);
      this.camNextLook.set(gate.x - 0.25, 1.24, 0.45);

      if (this.transitionTimer >= 0.9) {
        this.transitionSubPhase = 'PORTAL_DIVE';
        this.transitionTimer = 0;
      }
    } else if (this.transitionSubPhase === 'PORTAL_DIVE') {
      this.transitionTimer += dt;
      this.camNextPos.set(gate.x, 1.65, 0.4);
      this.camNextLook.set(gate.x, 1.38, -3.5);

      if (this.transitionTimer >= 0.45) {
        gate.unlockRing.visible = false;
        gate.terminalMat.emissiveIntensity = 0.45;
        this.enterCleanroomStation(this.transitionTarget);
      }
    }
  }

  private updateStage3Cleanroom(dt: number): void {
    const THREE = this.THREE;
    const rig = this.sixDofRig;

    this.camNextPos.set(
      0.48 + this.pointerOffsetX * 0.2,
      2.28 - this.pointerOffsetY * 0.1,
      5.25,
    );
    this.camNextLook.set(0.42, 1.12, 0.25);

    if (this.teleopMode) {
      // Smooth servo interpolation toward user-commanded joint angles (FK Teleop)
      const m = this.manualCurrentAngles;
      const t = this.manualTargetAngles;
      const lam = 12;
      m.j1 = THREE.MathUtils.damp(m.j1, t.j1, lam, dt);
      m.j2 = THREE.MathUtils.damp(m.j2, t.j2, lam, dt);
      m.j3 = THREE.MathUtils.damp(m.j3, t.j3, lam, dt);
      m.j4 = THREE.MathUtils.damp(m.j4, t.j4, lam, dt);
      m.j5 = THREE.MathUtils.damp(m.j5, t.j5, lam, dt);
      m.j6 = THREE.MathUtils.damp(m.j6, t.j6, lam, dt);
      m.gripper = THREE.MathUtils.damp(m.gripper, t.gripper, lam, dt);

      applySixDofJointAngles(rig, m);
      this.currentAngles = { ...m };
      return;
    }

    const pickPos = rig.dispenserSlotWorld;
    const placePos = rig.readingPlinthWorld;

    if (this.armPhase === 'APPROACH_PICK') {
      this.armTimer += dt;
      const dur = 0.55;
      const t = Math.min(1, this.armTimer / dur);
      const ease = 1 - Math.pow(1 - t, 3);

      this.effCurrent.lerpVectors(this.effStart, pickPos, ease);
      this.effCurrent.y += Math.sin(t * Math.PI) * 0.36;
      this.gripperOpen = THREE.MathUtils.damp(this.gripperOpen, 1.0, 12, dt);
      this.wristRoll = THREE.MathUtils.damp(this.wristRoll, 0, 8, dt);

      if (t >= 1) {
        this.armPhase = 'GRIP_CLOSE';
        this.armTimer = 0;
        this.callbacks.onArmPhaseChange('GRIP_CLOSE');
      }
    } else if (this.armPhase === 'GRIP_CLOSE') {
      this.armTimer += dt;
      const dur = 0.24;
      const t = Math.min(1, this.armTimer / dur);
      this.effCurrent.copy(pickPos);
      this.gripperOpen = 1 - t;

      if (t >= 1) {
        rig.podCarrySlot.add(rig.activePod);
        rig.activePod.position.set(0, 0, 0);
        this.podAttached = true;

        this.effStart.copy(pickPos);
        this.armPhase = 'TRANSIT_TO_PLINTH';
        this.armTimer = 0;
        this.callbacks.onArmPhaseChange('TRANSIT_TO_PLINTH');
      }
    } else if (this.armPhase === 'TRANSIT_TO_PLINTH') {
      this.armTimer += dt;
      const dur = 0.68;
      const t = Math.min(1, this.armTimer / dur);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.effCurrent.lerpVectors(pickPos, placePos, ease);
      this.effCurrent.y += Math.sin(t * Math.PI) * 0.64;
      this.gripperOpen = 0;
      this.wristRoll = ease * Math.PI * 0.5;

      if (t >= 1) {
        this.armPhase = 'PLACE_POD';
        this.armTimer = 0;
        this.callbacks.onArmPhaseChange('PLACE_POD');
      }
    } else if (this.armPhase === 'PLACE_POD') {
      this.armTimer += dt;
      const dur = 0.26;
      const t = Math.min(1, this.armTimer / dur);

      if (this.podAttached && t >= 0.35) {
        rig.root.add(rig.activePod);
        rig.activePod.position.copy(placePos);
        rig.activePod.rotation.set(0, 0, 0);
        this.podAttached = false;
      }

      this.gripperOpen = Math.min(1, t * 1.4);
      this.effCurrent.copy(placePos);
      this.effCurrent.y = placePos.y + t * 0.32;

      if (t >= 1) {
        this.armPhase = 'HOLD_MONITOR';
        this.armTimer = 0;
        this.callbacks.onArmPhaseChange('HOLD_MONITOR');
        this.callbacks.onPodStabilized(this.currentPodIndex);
      }
    } else if (this.armPhase === 'HOLD_MONITOR') {
      this.effTarget.set(
        placePos.x - 0.16,
        placePos.y + 0.42,
        placePos.z - 0.08,
      );
      this.effCurrent.lerp(this.effTarget, Math.min(1, dt * 4));
      this.gripperOpen = 0.85;
      rig.plinthRingMat.emissiveIntensity = 0.72;
    }

    this.currentAngles = solveSixDofArmIK(
      rig,
      this.effCurrent,
      this.wristRoll,
      this.gripperOpen,
    );
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);

    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
      this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);
      if (this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }

    this.scene?.traverse((obj) => {
      const mesh = obj as THREEType.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    this.materials?.dispose();
    this.renderer?.dispose();
  }
}
