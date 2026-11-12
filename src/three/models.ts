import type * as THREEType from 'three';
import type { RoboticsMaterialSet } from './materials';
import { STATIONS, type StationId } from '../data/portfolioData';

export interface GateRig {
  stationId: StationId;
  x: number;
  group: THREEType.Group;
  ringMat: THREEType.MeshStandardMaterial;
  terminalMat: THREEType.MeshStandardMaterial;
  terminalPos: THREEType.Vector3;
  unlockRing: THREEType.Mesh;
  unlockRingMat: THREEType.MeshBasicMaterial;
}

export interface HighwayRig {
  root: THREEType.Group;
  gates: Map<StationId, GateRig>;
  sensorBeam: THREEType.Mesh;
  sensorBeamMat: THREEType.MeshBasicMaterial;
}

export interface ScoutBotRig {
  root: THREEType.Group;
  wheels: THREEType.Object3D[];
  lidarHead: THREEType.Object3D;
  sensorMat: THREEType.MeshStandardMaterial;
}

export interface HumanoidRig {
  root: THREEType.Group;
  pelvis: THREEType.Group;
  spineMid: THREEType.Group;
  torso: THREEType.Group;
  head: THREEType.Group;
  leftShoulder: THREEType.Group;
  leftElbow: THREEType.Group;
  leftFingers: THREEType.Group;
  rightShoulder: THREEType.Group;
  rightElbow: THREEType.Group;
  rightFingers: THREEType.Group;
  rightHandScanMat: THREEType.MeshStandardMaterial;
  leftHip: THREEType.Group;
  leftKnee: THREEType.Group;
  leftAnkle: THREEType.Group;
  rightHip: THREEType.Group;
  rightKnee: THREEType.Group;
  rightAnkle: THREEType.Group;
  visorBarMat: THREEType.MeshStandardMaterial;
}

export interface SixDofArmRig {
  root: THREEType.Group;
  j1Waist: THREEType.Group;
  j2Shoulder: THREEType.Group;
  j3Elbow: THREEType.Group;
  j4ForearmRoll: THREEType.Group;
  j5WristPitch: THREEType.Group;
  j6ToolFlange: THREEType.Group;
  leftJaw: THREEType.Group;
  rightJaw: THREEType.Group;
  podCarrySlot: THREEType.Group;
  activePod: THREEType.Group;
  activePodAccentMat: THREEType.MeshStandardMaterial;
  conveyorPods: THREEType.Group[];
  dispenserSlotWorld: THREEType.Vector3;
  readingPlinthWorld: THREEType.Vector3;
  plinthRingMat: THREEType.MeshStandardMaterial;
  upperLen: number;
  foreLen: number;
  shoulderPivotY: number;
}

function buildOverheadLightBay(
  THREE: typeof THREEType,
  mats: RoboticsMaterialSet,
  width: number,
  x: number,
  y: number,
  z: number,
): THREEType.Group {
  const g = new THREE.Group();
  g.position.set(x, y, z);

  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.14, 1.35),
    mats.darkAnodized,
  );
  g.add(housing);

  const diffuser = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.3, 0.95),
    mats.lightPanel,
  );
  diffuser.rotation.x = Math.PI / 2;
  diffuser.position.y = -0.072;
  g.add(diffuser);

  return g;
}

export function buildRoboticsHighway(
  THREE: typeof THREEType,
  mats: RoboticsMaterialSet,
): HighwayRig {
  const root = new THREE.Group();
  root.name = 'MinimalistTestFacility';

  // Smooth matte epoxy test facility floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 38),
    mats.epoxyFloor,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  // Clean architectural rear wall with subtle acoustic/cleanroom paneling
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(44, 10, 0.35),
    mats.wallConcrete,
  );
  backWall.position.set(0, 5, -7.8);
  backWall.receiveShadow = true;
  root.add(backWall);

  // Architectural recessed wall pilasters
  const pilasterGeo = new THREE.BoxGeometry(0.42, 10, 0.45);
  for (let px = -16; px <= 16; px += 8) {
    const p = new THREE.Mesh(pilasterGeo, mats.darkAnodized);
    p.position.set(px, 5, -7.55);
    root.add(p);
  }

  // Soft overhead architectural light bays
  for (let lx = -10; lx <= 10; lx += 10) {
    root.add(buildOverheadLightBay(THREE, mats, 6.2, lx, 6.2, -0.5));
  }

  // Test Track Lane Slab (offset >= 0.025m on Y to avoid Z-fighting)
  const trackBase = new THREE.Mesh(
    new THREE.BoxGeometry(27.4, 0.04, 3.0),
    mats.darkAnodized,
  );
  trackBase.position.set(0, 0.02, 0);
  trackBase.receiveShadow = true;
  root.add(trackBase);

  const trackTop = new THREE.Mesh(
    new THREE.PlaneGeometry(27.0, 2.7),
    mats.testTrackSurface,
  );
  trackTop.rotation.x = -Math.PI / 2;
  trackTop.position.set(0, 0.043, 0);
  trackTop.receiveShadow = true;
  root.add(trackTop);

  // Machined Brushed Aluminum Precision Guide Rail along front lane for the AMR Rover
  const guideRail = new THREE.Mesh(
    new THREE.BoxGeometry(27.0, 0.022, 0.075),
    mats.machinedSteel,
  );
  guideRail.position.set(0, 0.054, 0.72);
  root.add(guideRail);

  // Restrained active path indicator strip inlaid in guide rail
  const sensorBeamMat = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const sensorBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.05),
    sensorBeamMat,
  );
  sensorBeam.rotation.x = -Math.PI / 2;
  sensorBeam.position.set(0, 0.068, 0.72);
  sensorBeam.visible = false;
  root.add(sensorBeam);

  // Clean low-profile safety curbs
  const curbGeo = new THREE.BoxGeometry(27.4, 0.06, 0.12);
  const curbFront = new THREE.Mesh(curbGeo, mats.machinedSteel);
  curbFront.position.set(0, 0.03, 1.48);
  const curbBack = new THREE.Mesh(curbGeo, mats.machinedSteel);
  curbBack.position.set(0, 0.03, -1.48);
  root.add(curbFront, curbBack);

  // 6 Minimalist Architectural Station Portals
  const gates = new Map<StationId, GateRig>();

  for (const st of STATIONS) {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(st.gateX, 0, 0);

    // Anchored steel base plates
    const footGeo = new THREE.BoxGeometry(0.46, 0.08, 0.46);
    const footL = new THREE.Mesh(footGeo, mats.darkAnodized);
    footL.position.set(0, 0.04, -1.72);
    footL.castShadow = true;
    footL.receiveShadow = true;

    const footR = new THREE.Mesh(footGeo, mats.darkAnodized);
    footR.position.set(0, 0.04, 1.72);
    footR.castShadow = true;
    footR.receiveShadow = true;
    gateGroup.add(footL, footR);

    // Tapered architectural columns
    const colGeo = new THREE.BoxGeometry(0.22, 2.95, 0.24);
    const colL = new THREE.Mesh(colGeo, mats.matteComposite);
    colL.position.set(0, 1.52, -1.72);
    colL.castShadow = true;

    const colR = new THREE.Mesh(colGeo, mats.matteComposite);
    colR.position.set(0, 1.52, 1.72);
    colR.castShadow = true;
    gateGroup.add(colL, colR);

    // Overhead brushed steel architectural lintel
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.2, 3.74),
      mats.machinedSteel,
    );
    lintel.position.set(0, 3.06, 0);
    lintel.castShadow = true;
    gateGroup.add(lintel);

    // Restrained single status LED strip on gate lintel & column inner edge
    const ringMat = new THREE.MeshStandardMaterial({
      color: st.accentNumber,
      emissive: st.accentNumber,
      emissiveIntensity: st.id === 'HOME' ? 0.8 : 0.35,
      roughness: 0.3,
      metalness: 0.2,
    });
    const statusBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.035, 2.8),
      ringMat,
    );
    statusBar.position.set(0.145, 2.98, 0);
    gateGroup.add(statusBar);

    // Minimalist Security Access Terminal Pedestal
    const pedestalPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.055, 1.05, 16),
      mats.machinedSteel,
    );
    pedestalPost.position.set(-0.55, 0.525, 1.38);
    pedestalPost.castShadow = true;
    gateGroup.add(pedestalPost);

    const terminalHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.28, 0.36),
      mats.matteComposite,
    );
    terminalHousing.position.set(-0.55, 1.12, 1.38);
    terminalHousing.rotation.z = 0.32;
    gateGroup.add(terminalHousing);

    const terminalMat = new THREE.MeshStandardMaterial({
      color: 0x0b1220,
      emissive: st.accentNumber,
      emissiveIntensity: 0.45,
      roughness: 0.08,
      metalness: 0.15,
    });
    const terminalScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.22),
      terminalMat,
    );
    terminalScreen.position.set(-0.522, 1.13, 1.38);
    terminalScreen.rotation.y = Math.PI / 2;
    terminalScreen.rotation.x = -0.32;
    gateGroup.add(terminalScreen);

    // Subtle crisp unlock ring (brief clean expansion when humanoid scans terminal)
    const unlockRingMat = new THREE.MeshBasicMaterial({
      color: st.accentNumber,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const unlockRing = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.46, 36),
      unlockRingMat,
    );
    unlockRing.position.set(0, 1.5, 0);
    unlockRing.rotation.y = Math.PI / 2;
    unlockRing.visible = false;
    gateGroup.add(unlockRing);

    root.add(gateGroup);
    gates.set(st.id, {
      stationId: st.id,
      x: st.gateX,
      group: gateGroup,
      ringMat,
      terminalMat,
      terminalPos: new THREE.Vector3(st.gateX - 0.55, 1.13, 1.38),
      unlockRing,
      unlockRingMat,
    });
  }

  return { root, gates, sensorBeam, sensorBeamMat };
}

export function buildScoutBot(
  THREE: typeof THREEType,
  mats: RoboticsMaterialSet,
): ScoutBotRig {
  const root = new THREE.Group();
  root.name = 'AutonomousGuideRover';

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.8),
    mats.contactShadowMat,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.008;
  root.add(shadow);

  // Lower Matte Carbon Composite Chassis (elongated for 6-wheeled rocker-bogie suspension)
  const lowerHull = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.1, 0.42),
    mats.matteComposite,
  );
  lowerHull.position.set(0, 0.135, 0);
  lowerHull.castShadow = true;
  root.add(lowerHull);

  // Cleanroom White Upper Delivery/Scout Payload Deck
  const upperCowl = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.07, 0.38),
    mats.cleanroomWhite,
  );
  upperCowl.position.set(-0.01, 0.22, 0);
  upperCowl.castShadow = true;
  root.add(upperCowl);

  // Rocker-Bogie Side Suspension Beams
  const rockerGeo = new THREE.BoxGeometry(0.66, 0.032, 0.028);
  const rockerL = new THREE.Mesh(rockerGeo, mats.machinedSteel);
  rockerL.position.set(0, 0.115, 0.215);
  const rockerR = new THREE.Mesh(rockerGeo, mats.machinedSteel);
  rockerR.position.set(0, 0.115, -0.215);
  root.add(rockerL, rockerR);

  // Brushed Steel Rear Bumper / Tow Bracket
  const rearBracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.08, 0.34),
    mats.machinedSteel,
  );
  rearBracket.position.set(-0.43, 0.16, 0);
  root.add(rearBracket);

  // 6 Industrial Rubber Wheels with Machined Aluminum Hubs (radius = 0.095)
  const wheels: THREEType.Object3D[] = [];
  const tireGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.062, 24);
  tireGeo.rotateX(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.068, 16);
  hubGeo.rotateX(Math.PI / 2);

  const offsets: [number, number][] = [
    [0.29, 0.245],
    [0.29, -0.245],
    [0.0, 0.245],
    [0.0, -0.245],
    [-0.29, 0.245],
    [-0.29, -0.245],
  ];

  for (const [wx, wz] of offsets) {
    const wg = new THREE.Group();
    wg.position.set(wx, 0.095, wz);
    const tire = new THREE.Mesh(tireGeo, mats.rubberTire);
    tire.castShadow = true;
    const hub = new THREE.Mesh(hubGeo, mats.machinedSteel);
    wg.add(tire, hub);
    root.add(wg);
    wheels.push(wg);
  }

  // Solid-State Rotating LiDAR Sensor Dome
  const lidarHead = new THREE.Group();
  lidarHead.position.set(0.08, 0.27, 0);
  const lidarMount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.085, 0.04, 20),
    mats.machinedSteel,
  );
  const lidarOptic = new THREE.Mesh(
    new THREE.CylinderGeometry(0.066, 0.066, 0.042, 20),
    mats.sensorGlass,
  );
  lidarOptic.position.y = 0.038;
  lidarHead.add(lidarMount, lidarOptic);
  root.add(lidarHead);

  // Front Optical Guidance Sensor Bar (restrained status LED)
  const sensorMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    emissive: 0x2563eb,
    emissiveIntensity: 1.0,
    roughness: 0.25,
  });
  const frontVisor = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.04, 0.32),
    mats.sensorGlass,
  );
  frontVisor.position.set(0.385, 0.14, 0);
  root.add(frontVisor);

  const statusLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.012, 0.24),
    sensorMat,
  );
  statusLine.position.set(0.398, 0.14, 0);
  root.add(statusLine);

  return { root, wheels, lidarHead, sensorMat };
}

export function buildHumanoidRobot(
  THREE: typeof THREEType,
  mats: RoboticsMaterialSet,
): HumanoidRig {
  const root = new THREE.Group();
  root.name = 'IndustrialHumanoidRobot';

  // Soft Grounded Contact Shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    mats.contactShadowMat,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.008;
  root.add(shadow);

  // Pelvis Gimbal (adult proportion: hip height ~0.96m, total height ~1.76m)
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.96, 0);
  root.add(pelvis);

  const pelvisCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.125, 0.11, 0.15, 16),
    mats.darkAnodized,
  );
  pelvisCore.castShadow = true;
  pelvis.add(pelvisCore);

  const pelvisShell = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.12, 0.17),
    mats.matteComposite,
  );
  pelvisShell.position.y = 0.01;
  pelvisShell.castShadow = true;
  pelvis.add(pelvisShell);

  // Segmented Articulated Spine (Lumbar Vertebrae + Dual-Rod Ball-Screw Actuators)
  const spineMid = new THREE.Group();
  spineMid.position.set(0, 0.09, 0);
  pelvis.add(spineMid);

  for (let i = 0; i < 3; i++) {
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088 - i * 0.004, 0.092 - i * 0.004, 0.045, 16),
      i === 1 ? mats.machinedSteel : mats.matteComposite,
    );
    disc.position.y = 0.03 + i * 0.058;
    disc.castShadow = true;
    spineMid.add(disc);
  }

  // Exposed Twin Ball-Screw / Hydraulic Spine Actuators
  const spineRodGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.22, 10);
  const spineSleeveGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.12, 10);
  for (const sx of [-0.095, 0.095]) {
    const rod = new THREE.Mesh(spineRodGeo, mats.machinedSteel);
    rod.position.set(sx, 0.1, -0.045);
    const sleeve = new THREE.Mesh(spineSleeveGeo, mats.darkAnodized);
    sleeve.position.set(sx, 0.06, -0.045);
    spineMid.add(rod, sleeve);
  }

  // Upper Torso / Ribcage Assembly
  const torso = new THREE.Group();
  torso.position.set(0, 0.2, 0);
  spineMid.add(torso);

  // Tapered Matte Carbon-Charcoal Ribcage Shell
  const ribcage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.125, 0.34, 14),
    mats.matteComposite,
  );
  ribcage.scale.set(1.05, 1, 0.68);
  ribcage.position.set(0, 0.19, 0);
  ribcage.castShadow = true;
  torso.add(ribcage);

  // Cleanroom White Sternum Armor Shield
  const sternum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.105, 0.26, 12),
    mats.cleanroomWhite,
  );
  sternum.scale.set(0.95, 1, 0.35);
  sternum.position.set(0, 0.21, 0.095);
  sternum.castShadow = true;
  torso.add(sternum);

  // Dorsal Power Pack & Thermal Radiator
  const powerPack = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.28, 0.11),
    mats.darkAnodized,
  );
  powerPack.position.set(0, 0.2, -0.12);
  powerPack.castShadow = true;
  torso.add(powerPack);

  // Shoulder Collar Yoke
  const shoulderYoke = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.055, 0.16),
    mats.machinedSteel,
  );
  shoulderYoke.position.set(0, 0.36, 0);
  shoulderYoke.castShadow = true;
  torso.add(shoulderYoke);

  // Sculpted Cranial Sensor Head (Figure AI / Atlas smooth dark-visor profile — NO boxy head)
  const head = new THREE.Group();
  head.position.set(0, 0.4, 0);
  torso.add(head);

  const neckGimbal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.052, 0.1, 14),
    mats.machinedSteel,
  );
  neckGimbal.position.y = 0.04;
  head.add(neckGimbal);

  // Smooth anatomical ovoid skull
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.102, 22, 18),
    mats.matteComposite,
  );
  skull.scale.set(0.88, 1.12, 1.05);
  skull.position.set(0, 0.17, 0);
  skull.castShadow = true;
  head.add(skull);

  // Sleek Curved Glossy Black Tinted Optical Sensor Visor
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.096, 22, 16, -Math.PI * 0.36, Math.PI * 0.72, Math.PI * 0.24, Math.PI * 0.44),
    mats.sensorGlass,
  );
  visor.scale.set(0.9, 1.04, 1.06);
  visor.rotation.y = Math.PI * 0.5;
  visor.position.set(0, 0.175, 0.012);
  head.add(visor);

  // Subtle Single Horizontal Status Bar on Visor (no cartoon eyes)
  const visorBarMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    emissive: 0x2563eb,
    emissiveIntensity: 1.1,
    roughness: 0.15,
  });
  const visorBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.008, 0.01),
    visorBarMat,
  );
  visorBar.position.set(0, 0.18, 0.108);
  head.add(visorBar);

  // Slender Anatomically Proportioned Arms with Exposed Elbow Hydraulic Rods & Multi-Fingered Hands
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.235, 0.34, 0);
    torso.add(shoulder);

    const shoulderDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.056, 0.056, 0.08, 18),
      mats.machinedSteel,
    );
    shoulderDrum.rotation.z = Math.PI / 2;
    shoulderDrum.castShadow = true;
    shoulder.add(shoulderDrum);

    const shoulderTorqueRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.057, 0.007, 8, 20),
      side === 1 ? mats.accentOrange : mats.accentBlue,
    );
    shoulderTorqueRing.rotation.y = Math.PI / 2;
    shoulderTorqueRing.position.x = side * 0.038;
    shoulder.add(shoulderTorqueRing);

    // Upper Arm Tapered Composite Shroud + Machined Strut
    const upperRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.02, 0.28, 12),
      mats.machinedSteel,
    );
    upperRod.position.y = -0.15;
    shoulder.add(upperRod);

    const upperShell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.036, 0.22, 14),
      mats.matteComposite,
    );
    upperShell.position.y = -0.14;
    upperShell.castShadow = true;
    shoulder.add(upperShell);

    // Elbow Joint with Exposed Dual-Rod Actuator
    const elbow = new THREE.Group();
    elbow.position.set(0, -0.3, 0);
    shoulder.add(elbow);

    const elbowCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.068, 16),
      mats.machinedSteel,
    );
    elbowCap.rotation.z = Math.PI / 2;
    elbow.add(elbowCap);

    // Exposed Dual-Rod Actuator behind elbow
    for (const az of [-0.026, 0.026]) {
      const actRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.14, 8),
        mats.machinedSteel,
      );
      actRod.position.set(side * 0.015, 0.04, -0.035 + az * 0.4);
      actRod.rotation.x = 0.28;
      elbow.add(actRod);
    }

    // Slender Tapered Forearm Housing
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.026, 0.26, 14),
      mats.cleanroomWhite,
    );
    forearm.position.y = -0.14;
    forearm.castShadow = true;
    elbow.add(forearm);

    const forearmFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.24, 0.045),
      mats.darkAnodized,
    );
    forearmFrame.position.set(0, -0.14, -0.012);
    elbow.add(forearmFrame);

    // Multi-Fingered Mechanical Hand (Wrist + Palm + Thumb + 4 Segmented Fingers)
    const wrist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.024, 0.035, 12),
      mats.machinedSteel,
    );
    wrist.position.y = -0.285;
    elbow.add(wrist);

    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.072, 0.064),
      mats.matteComposite,
    );
    palm.position.y = -0.335;
    palm.castShadow = true;
    elbow.add(palm);

    const scanMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x2563eb,
      emissiveIntensity: 0.85,
    });
    const palmSensor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.008, 12),
      scanMat,
    );
    palmSensor.rotation.z = Math.PI / 2;
    palmSensor.position.set(-side * 0.016, -0.335, 0);
    elbow.add(palmSensor);

    const fingersGroup = new THREE.Group();
    fingersGroup.position.set(0, -0.372, 0);
    elbow.add(fingersGroup);

    // 4 Articulated Fingers
    for (let f = 0; f < 4; f++) {
      const fz = -0.022 + f * 0.0145;
      const prox = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.038, 0.01),
        mats.machinedSteel,
      );
      prox.position.set(0, -0.019, fz);
      const dist = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.03, 0.009),
        mats.darkAnodized,
      );
      dist.position.set(-side * 0.004, -0.05, fz);
      dist.rotation.z = -side * 0.22;
      fingersGroup.add(prox, dist);
    }

    // Opposable Mechanical Thumb
    const thumb = new THREE.Mesh(
      new THREE.BoxGeometry(0.013, 0.042, 0.013),
      mats.machinedSteel,
    );
    thumb.position.set(-side * 0.01, 0.012, 0.038);
    thumb.rotation.x = 0.55;
    fingersGroup.add(thumb);

    return { shoulder, elbow, fingersGroup, scanMat };
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Slender Anatomically Proportioned Legs with Exposed Dual-Rod Hydraulic Knee Actuators
  // Total leg height = 0.44 (thigh) + 0.44 (shin) + 0.08 (ankle-to-sole) = 0.96m
  const buildLeg = (side: -1 | 1) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.105, -0.04, 0);
    pelvis.add(hip);

    const hipBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.056, 16, 16),
      mats.machinedSteel,
    );
    hip.add(hipBall);

    // Tapered Thigh Structural Strut + Composite Shell
    const femurStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.022, 0.42, 12),
      mats.machinedSteel,
    );
    femurStrut.position.y = -0.22;
    hip.add(femurStrut);

    const thighShell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.048, 0.36, 16),
      mats.matteComposite,
    );
    thighShell.scale.set(0.88, 1, 1.08);
    thighShell.position.y = -0.21;
    thighShell.castShadow = true;
    hip.add(thighShell);

    const knee = new THREE.Group();
    knee.position.set(0, -0.44, 0);
    hip.add(knee);

    const kneeDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.044, 0.088, 16),
      mats.machinedSteel,
    );
    kneeDrum.rotation.z = Math.PI / 2;
    kneeDrum.castShadow = true;
    knee.add(kneeDrum);

    const kneeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.046, 0.006, 8, 20),
      mats.accentOrange,
    );
    kneeRing.rotation.y = Math.PI / 2;
    kneeRing.position.x = side * 0.045;
    knee.add(kneeRing);

    // Exposed Dual-Rod Knee Ball-Screw / Hydraulic Actuators
    for (const rx of [-0.024, 0.024]) {
      const cylSleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.013, 0.15, 10),
        mats.darkAnodized,
      );
      cylSleeve.position.set(rx, -0.14, -0.042);
      const pistonRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.14, 8),
        mats.machinedSteel,
      );
      pistonRod.position.set(rx, -0.05, -0.042);
      knee.add(cylSleeve, pistonRod);
    }

    // Slender Tapered Shin Strut + Front Armor Fairing
    const shinStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.018, 0.42, 12),
      mats.machinedSteel,
    );
    shinStrut.position.y = -0.22;
    knee.add(shinStrut);

    const shinGuard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.032, 0.34, 14),
      mats.cleanroomWhite,
    );
    shinGuard.scale.set(0.82, 1, 0.9);
    shinGuard.position.set(0, -0.21, 0.014);
    shinGuard.castShadow = true;
    knee.add(shinGuard);

    const ankle = new THREE.Group();
    ankle.position.set(0, -0.44, 0);
    knee.add(ankle);

    const ankleJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 12),
      mats.machinedSteel,
    );
    ankle.add(ankleJoint);

    // Sleek Articulated Humanoid Foot (sole sits at y = -0.04 -> world y = 0)
    const footChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.095, 0.042, 0.22),
      mats.darkAnodized,
    );
    footChassis.position.set(0, -0.022, 0.042);
    footChassis.castShadow = true;
    ankle.add(footChassis);

    const solePad = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.016, 0.23),
      mats.rubberTire,
    );
    solePad.position.set(0, -0.04, 0.042);
    ankle.add(solePad);

    return { hip, knee, ankle };
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  return {
    root,
    pelvis,
    spineMid,
    torso,
    head,
    leftShoulder: leftArm.shoulder,
    leftElbow: leftArm.elbow,
    leftFingers: leftArm.fingersGroup,
    rightShoulder: rightArm.shoulder,
    rightElbow: rightArm.elbow,
    rightFingers: rightArm.fingersGroup,
    rightHandScanMat: rightArm.scanMat,
    leftHip: leftLeg.hip,
    leftKnee: leftLeg.knee,
    leftAnkle: leftLeg.ankle,
    rightHip: rightLeg.hip,
    rightKnee: rightLeg.knee,
    rightAnkle: rightLeg.ankle,
    visorBarMat,
  };
}

function buildDataPodMesh(
  THREE: typeof THREEType,
  mats: RoboticsMaterialSet,
  accentColor: number,
): { group: THREEType.Group; accentMat: THREEType.MeshStandardMaterial } {
  const group = new THREE.Group();

  // Machined Titanium + Matte Composite Storage Cartridge
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.125, 0.138, 0.21, 16),
    mats.matteComposite,
  );
  body.castShadow = true;
  group.add(body);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.128, 0.045, 16),
    mats.machinedSteel,
  );
  collar.position.y = 0.125;
  group.add(collar);

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.35,
  });

  const statusBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.132, 0.132, 0.022, 20),
    accentMat,
  );
  statusBand.position.y = 0.02;
  group.add(statusBand);

  return { group, accentMat };
}

export function buildSixDofCell(
  THREE: typeof THREEType,
  mats: RoboticsMaterialSet,
): SixDofArmRig {
  const root = new THREE.Group();
  root.name = 'IndustrialSixDofCell';

  // Smooth Matte Epoxy Cleanroom Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 26),
    mats.epoxyFloor,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);

  // Clean Minimalist Architectural Wall & Ceiling Light Bay
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(28, 9, 0.35),
    mats.wallConcrete,
  );
  backWall.position.set(0, 4.5, -5.6);
  backWall.receiveShadow = true;
  root.add(backWall);

  for (let px = -9; px <= 9; px += 6) {
    const pilaster = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 9, 0.42),
      mats.darkAnodized,
    );
    pilaster.position.set(px, 4.5, -5.4);
    root.add(pilaster);
  }

  root.add(buildOverheadLightBay(THREE, mats, 5.4, -0.3, 4.8, 0.2));

  // Heavy Bolted Pedestal at (-0.85, 0, 0) — KUKA / UR10e Inspired
  const armBaseX = -0.85;
  const armBaseZ = 0;

  const armShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 2.0),
    mats.contactShadowMat,
  );
  armShadow.rotation.x = -Math.PI / 2;
  armShadow.position.set(armBaseX, 0.008, armBaseZ);
  root.add(armShadow);

  // Octagonal Steel Base Flange
  const baseFlange = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.58, 0.1, 8),
    mats.darkAnodized,
  );
  baseFlange.position.set(armBaseX, 0.05, armBaseZ);
  baseFlange.castShadow = true;
  baseFlange.receiveShadow = true;
  root.add(baseFlange);

  // Safety Warning Stripe Collar on Pedestal Base
  const hazardCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.44, 0.08, 24),
    mats.warningStripe,
  );
  hazardCollar.position.set(armBaseX, 0.14, armBaseZ);
  root.add(hazardCollar);

  // Instanced Hex Anchor Bolts
  const boltGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6);
  const boltInst = new THREE.InstancedMesh(boltGeo, mats.machinedSteel, 8);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    dummy.position.set(
      armBaseX + Math.cos(ang) * 0.47,
      0.115,
      armBaseZ + Math.sin(ang) * 0.47,
    );
    dummy.updateMatrix();
    boltInst.setMatrixAt(i, dummy.matrix);
  }
  boltInst.instanceMatrix.needsUpdate = true;
  boltInst.computeBoundingSphere();
  root.add(boltInst);

  // Heavy Cast-Metal Pedestal Column
  const pedestalCol = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.36, 0.52, 24),
    mats.matteComposite,
  );
  pedestalCol.position.set(armBaseX, 0.44, armBaseZ);
  pedestalCol.castShadow = true;
  root.add(pedestalCol);

  // J1: Cast-Metal Waist Yaw Turret
  const shoulderPivotY = 0.98;
  const j1Waist = new THREE.Group();
  j1Waist.position.set(armBaseX, 0.7, armBaseZ);
  root.add(j1Waist);

  const waistTurret = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.3, 0.22, 24),
    mats.darkAnodized,
  );
  waistTurret.position.y = 0.11;
  waistTurret.castShadow = true;
  j1Waist.add(waistTurret);

  const j1TorqueRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.292, 0.012, 10, 32),
    mats.accentOrange,
  );
  j1TorqueRing.rotation.x = Math.PI / 2;
  j1TorqueRing.position.y = 0.11;
  j1Waist.add(j1TorqueRing);

  // Cast Shoulder Yoke Saddle
  const shoulderSaddle = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.26, 0.32),
    mats.cleanroomWhite,
  );
  shoulderSaddle.position.y = 0.26;
  shoulderSaddle.castShadow = true;
  j1Waist.add(shoulderSaddle);

  // Base-to-Shoulder Dress Pack Conduit Loop (visible industrial cable management)
  const baseConduitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, -0.1, -0.14),
    new THREE.Vector3(-0.32, 0.08, -0.22),
    new THREE.Vector3(-0.26, 0.28, -0.16),
    new THREE.Vector3(-0.18, 0.34, -0.04),
  ]);
  const baseConduit = new THREE.Mesh(
    new THREE.TubeGeometry(baseConduitCurve, 18, 0.026, 10, false),
    mats.corrugatedConduit,
  );
  j1Waist.add(baseConduit);

  // J2: Shoulder Harmonic Drive Pivot (world y = 0.98)
  const j2Shoulder = new THREE.Group();
  j2Shoulder.position.set(0, 0.28, 0);
  j1Waist.add(j2Shoulder);

  const j2Housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.145, 0.145, 0.42, 24),
    mats.machinedSteel,
  );
  j2Housing.rotation.x = Math.PI / 2;
  j2Housing.castShadow = true;
  j2Shoulder.add(j2Housing);

  // Harmonic drive end-cap + Safety Orange torque ring
  const j2Cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.125, 0.125, 0.45, 22),
    mats.matteComposite,
  );
  j2Cap.rotation.x = Math.PI / 2;
  j2Shoulder.add(j2Cap);

  const j2Ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.135, 0.011, 10, 28),
    mats.accentOrange,
  );
  j2Ring.position.z = 0.22;
  j2Shoulder.add(j2Ring);

  // Tapered Upper Arm Cast-Composite Housing (length L1 = 1.32)
  const upperLen = 1.32;
  const upperArmCasting = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.145, upperLen, 16),
    mats.cleanroomWhite,
  );
  upperArmCasting.scale.set(0.95, 1, 1.15);
  upperArmCasting.position.y = upperLen * 0.5;
  upperArmCasting.castShadow = true;
  j2Shoulder.add(upperArmCasting);

  // Dark Composite Inspection Access Hatch along upper arm
  const upperHatch = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, upperLen * 0.62, 0.05),
    mats.matteComposite,
  );
  upperHatch.position.set(0, upperLen * 0.5, 0.11);
  j2Shoulder.add(upperHatch);

  // Visible Corrugated Dress Pack Conduit strapped along Upper Arm
  const upperConduitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, 0.06, -0.1),
    new THREE.Vector3(-0.17, 0.45, -0.13),
    new THREE.Vector3(-0.15, 0.92, -0.11),
    new THREE.Vector3(-0.12, upperLen - 0.05, -0.06),
  ]);
  const upperConduit = new THREE.Mesh(
    new THREE.TubeGeometry(upperConduitCurve, 20, 0.024, 10, false),
    mats.corrugatedConduit,
  );
  j2Shoulder.add(upperConduit);

  // Machined Saddle Clamps holding Dress Pack
  for (const cy of [0.35, 0.85]) {
    const clamp = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.008, 8, 16),
      mats.machinedSteel,
    );
    clamp.rotation.x = Math.PI / 2;
    clamp.position.set(-0.16, cy, -0.12);
    j2Shoulder.add(clamp);
  }

  // J3: Elbow Harmonic Drive Pivot
  const j3Elbow = new THREE.Group();
  j3Elbow.position.set(0, upperLen, 0);
  j2Shoulder.add(j3Elbow);

  const j3Housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.32, 22),
    mats.machinedSteel,
  );
  j3Housing.rotation.x = Math.PI / 2;
  j3Housing.castShadow = true;
  j3Elbow.add(j3Housing);

  const j3Ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.115, 0.01, 10, 26),
    mats.accentBlue,
  );
  j3Ring.position.z = 0.165;
  j3Elbow.add(j3Ring);

  // J4: Tapered Forearm Housing + Roll Wrist (length L2 = 1.18)
  const foreLen = 1.18;
  const j4ForearmRoll = new THREE.Group();
  j3Elbow.add(j4ForearmRoll);

  const forearmCasting = new THREE.Mesh(
    new THREE.CylinderGeometry(0.072, 0.112, foreLen, 16),
    mats.cleanroomWhite,
  );
  forearmCasting.position.y = foreLen * 0.5;
  forearmCasting.castShadow = true;
  j4ForearmRoll.add(forearmCasting);

  const forearmCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.114, 0.24, 18),
    mats.matteComposite,
  );
  forearmCollar.position.y = 0.2;
  j4ForearmRoll.add(forearmCollar);

  // Dress Pack Conduit along Forearm to Wrist Manifold
  const foreConduitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.11, 0.04, -0.06),
    new THREE.Vector3(-0.12, 0.42, -0.11),
    new THREE.Vector3(-0.09, 0.85, -0.08),
    new THREE.Vector3(-0.06, foreLen - 0.06, -0.03),
  ]);
  const foreConduit = new THREE.Mesh(
    new THREE.TubeGeometry(foreConduitCurve, 18, 0.02, 10, false),
    mats.corrugatedConduit,
  );
  j4ForearmRoll.add(foreConduit);

  // J5: Wrist Pitch Clevis
  const j5WristPitch = new THREE.Group();
  j5WristPitch.position.set(0, foreLen, 0);
  j4ForearmRoll.add(j5WristPitch);

  const j5Drum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.068, 0.14, 18),
    mats.machinedSteel,
  );
  j5Drum.rotation.z = Math.PI / 2;
  j5WristPitch.add(j5Drum);

  const j5Ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.068, 0.007, 8, 22),
    mats.accentOrange,
  );
  j5Ring.rotation.y = Math.PI / 2;
  j5Ring.position.x = 0.072;
  j5WristPitch.add(j5Ring);

  // J6: Tool Flange + Precision Parallel-Jaw Pneumatic/Servo Gripper
  const j6ToolFlange = new THREE.Group();
  j6ToolFlange.position.set(0, -0.14, 0);
  j5WristPitch.add(j6ToolFlange);

  const toolCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.062, 0.045, 18),
    mats.darkAnodized,
  );
  toolCollar.position.y = 0.035;
  j6ToolFlange.add(toolCollar);

  // Linear Guide Rail Housing
  const gripperRailBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.065, 0.11),
    mats.machinedSteel,
  );
  gripperRailBody.castShadow = true;
  j6ToolFlange.add(gripperRailBody);

  const railGroove = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.02, 0.116),
    mats.darkAnodized,
  );
  j6ToolFlange.add(railGroove);

  // Subtle status indicator LED on gripper housing
  const gripperLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.01, 0.012),
    mats.statusStrip,
  );
  gripperLed.position.set(0, 0.02, 0.056);
  j6ToolFlange.add(gripperLed);

  // Machined Parallel Jaws with Tapered Fingertips
  const buildGripperJaw = (side: -1 | 1) => {
    const jg = new THREE.Group();
    jg.position.set(side * 0.1, -0.06, 0);

    const slider = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 0.075, 0.068),
      mats.machinedSteel,
    );
    slider.castShadow = true;
    jg.add(slider);

    const fingerTip = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.09, 0.056),
      mats.matteComposite,
    );
    fingerTip.position.set(-side * 0.006, -0.07, 0);
    fingerTip.castShadow = true;
    jg.add(fingerTip);

    return jg;
  };

  const leftJaw = buildGripperJaw(-1);
  const rightJaw = buildGripperJaw(1);
  j6ToolFlange.add(leftJaw, rightJaw);

  const podCarrySlot = new THREE.Group();
  podCarrySlot.position.set(0, -0.15, 0);
  j6ToolFlange.add(podCarrySlot);

  // Automated Industrial Data Pod Transfer Conveyor (left of arm)
  const dispenserX = -2.42;
  const dispenserZ = 0.48;
  const conveyorDeck = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.11, 0.68),
    mats.darkAnodized,
  );
  conveyorDeck.position.set(dispenserX, 0.66, dispenserZ);
  conveyorDeck.castShadow = true;
  conveyorDeck.receiveShadow = true;
  root.add(conveyorDeck);

  const conveyorSurface = new THREE.Mesh(
    new THREE.BoxGeometry(1.44, 0.02, 0.56),
    mats.matteComposite,
  );
  conveyorSurface.position.set(dispenserX, 0.725, dispenserZ);
  root.add(conveyorSurface);

  const standLegGeo = new THREE.BoxGeometry(0.1, 0.66, 0.48);
  const cLegL = new THREE.Mesh(standLegGeo, mats.machinedSteel);
  cLegL.position.set(dispenserX - 0.55, 0.33, dispenserZ);
  const cLegR = new THREE.Mesh(standLegGeo, mats.machinedSteel);
  cLegR.position.set(dispenserX + 0.55, 0.33, dispenserZ);
  root.add(cLegL, cLegR);

  const dispenserSlotWorld = new THREE.Vector3(-1.9, 0.84, dispenserZ);

  const conveyorPods: THREEType.Group[] = [];
  for (let i = 0; i < 2; i++) {
    const p = buildDataPodMesh(THREE, mats, i === 0 ? 0x6d28d9 : 0x2563eb);
    p.group.position.set(dispenserX - 0.48 + i * 0.36, 0.84, dispenserZ);
    root.add(p.group);
    conveyorPods.push(p.group);
  }

  const activePodBuild = buildDataPodMesh(THREE, mats, 0xea580c);
  activePodBuild.group.position.copy(dispenserSlotWorld);
  root.add(activePodBuild.group);

  // Architectural Reading Zone Plinth (positioned left-of-center beside the right-side panel)
  const plinthPos = new THREE.Vector3(0.45, 0.68, 0.56);
  const plinthBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 0.68, 20),
    mats.matteComposite,
  );
  plinthBase.position.set(plinthPos.x, 0.34, plinthPos.z);
  plinthBase.castShadow = true;
  plinthBase.receiveShadow = true;
  root.add(plinthBase);

  const plinthDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.34, 0.05, 24),
    mats.machinedSteel,
  );
  plinthDeck.position.set(plinthPos.x, 0.7, plinthPos.z);
  root.add(plinthDeck);

  const plinthRingMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    emissive: 0x2563eb,
    emissiveIntensity: 0.7,
    roughness: 0.25,
  });
  const plinthRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.365, 0.011, 10, 32),
    plinthRingMat,
  );
  plinthRing.rotation.x = Math.PI / 2;
  plinthRing.position.set(plinthPos.x, 0.728, plinthPos.z);
  root.add(plinthRing);

  const readingPlinthWorld = new THREE.Vector3(plinthPos.x, 0.85, plinthPos.z);

  return {
    root,
    j1Waist,
    j2Shoulder,
    j3Elbow,
    j4ForearmRoll,
    j5WristPitch,
    j6ToolFlange,
    leftJaw,
    rightJaw,
    podCarrySlot,
    activePod: activePodBuild.group,
    activePodAccentMat: activePodBuild.accentMat,
    conveyorPods,
    dispenserSlotWorld,
    readingPlinthWorld,
    plinthRingMat,
    upperLen,
    foreLen,
    shoulderPivotY,
  };
}

export interface JointAnglesDeg {
  j1: number;
  j2: number;
  j3: number;
  j4: number;
  j5: number;
  j6: number;
  gripper: number; // 0..100 %
}

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

/**
 * Direct Forward Kinematics for Manual Teleop Mode (angles in degrees)
 */
export function applySixDofJointAngles(
  rig: SixDofArmRig,
  angles: JointAnglesDeg,
): void {
  rig.j1Waist.rotation.y = angles.j1 * DEG_TO_RAD;
  rig.j2Shoulder.rotation.x = angles.j2 * DEG_TO_RAD;
  rig.j3Elbow.rotation.x = angles.j3 * DEG_TO_RAD;
  rig.j4ForearmRoll.rotation.y = angles.j4 * DEG_TO_RAD;
  rig.j5WristPitch.rotation.x = angles.j5 * DEG_TO_RAD;
  rig.j6ToolFlange.rotation.y = angles.j6 * DEG_TO_RAD;

  const openAmt = Math.max(0, Math.min(1, angles.gripper / 100));
  const jawX = 0.128 + openAmt * 0.075;
  rig.leftJaw.position.x = -jawX;
  rig.rightJaw.position.x = jawX;
}

/**
 * Analytical 2-link planar Inverse Kinematics + Waist Yaw + Wrist Pitch Leveling
 */
export function solveSixDofArmIK(
  rig: SixDofArmRig,
  targetWorld: THREEType.Vector3,
  wristRollAngle: number,
  gripperOpenAmount: number,
): JointAnglesDeg {
  const basePos = rig.j1Waist.position;
  const dx = targetWorld.x - basePos.x;
  const dz = targetWorld.z - basePos.z;

  const yaw = Math.atan2(dx, dz);
  rig.j1Waist.rotation.y = yaw;

  const rDist = Math.hypot(dx, dz);
  const wristTargetY = targetWorld.y + 0.29 - rig.shoulderPivotY;
  const L1 = rig.upperLen;
  const L2 = rig.foreLen;

  const dClamped = Math.min(
    L1 + L2 - 0.05,
    Math.max(0.35, Math.hypot(rDist, wristTargetY)),
  );

  const cosElbow = Math.max(
    -1,
    Math.min(1, (dClamped * dClamped - L1 * L1 - L2 * L2) / (2 * L1 * L2)),
  );
  const elbowBend = Math.acos(cosElbow);

  const alpha = Math.atan2(rDist, wristTargetY);
  const cosBeta = Math.max(
    -1,
    Math.min(1, (L1 * L1 + dClamped * dClamped - L2 * L2) / (2 * L1 * dClamped)),
  );
  const beta = Math.acos(cosBeta);

  const shoulderPitch = alpha - beta;
  const elbowPitch = elbowBend;
  const wristPitch = -(shoulderPitch + elbowPitch);

  rig.j2Shoulder.rotation.x = shoulderPitch;
  rig.j3Elbow.rotation.x = elbowPitch;
  rig.j4ForearmRoll.rotation.y = 0;
  rig.j5WristPitch.rotation.x = wristPitch;
  rig.j6ToolFlange.rotation.y = wristRollAngle;

  // Precision linear jaw slide (0 = clamped around 0.132m pod, 1 = open)
  const jawX = 0.128 + gripperOpenAmount * 0.075;
  rig.leftJaw.position.x = -jawX;
  rig.rightJaw.position.x = jawX;

  return {
    j1: yaw * RAD_TO_DEG,
    j2: shoulderPitch * RAD_TO_DEG,
    j3: elbowPitch * RAD_TO_DEG,
    j4: 0,
    j5: wristPitch * RAD_TO_DEG,
    j6: wristRollAngle * RAD_TO_DEG,
    gripper: Math.round(Math.max(0, Math.min(1, gripperOpenAmount)) * 100),
  };
}
