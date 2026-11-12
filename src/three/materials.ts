import type * as THREEType from 'three';

export interface RoboticsMaterialSet {
  matteComposite: THREEType.MeshStandardMaterial;
  cleanroomWhite: THREEType.MeshPhysicalMaterial;
  machinedSteel: THREEType.MeshStandardMaterial;
  darkAnodized: THREEType.MeshStandardMaterial;
  sensorGlass: THREEType.MeshPhysicalMaterial;
  rubberTire: THREEType.MeshStandardMaterial;
  corrugatedConduit: THREEType.MeshStandardMaterial;
  epoxyFloor: THREEType.MeshStandardMaterial;
  testTrackSurface: THREEType.MeshStandardMaterial;
  warningStripe: THREEType.MeshStandardMaterial;
  wallConcrete: THREEType.MeshStandardMaterial;
  lightPanel: THREEType.MeshStandardMaterial;
  accentOrange: THREEType.MeshStandardMaterial;
  accentBlue: THREEType.MeshStandardMaterial;
  accentIndigo: THREEType.MeshStandardMaterial;
  statusStrip: THREEType.MeshStandardMaterial;
  contactShadowMat: THREEType.MeshBasicMaterial;
  dispose: () => void;
}

function createBrushedMetalTexture(
  THREE: typeof THREEType,
  maxAnisotropy: number,
): THREEType.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 520; i++) {
    const y = Math.random() * size;
    const alpha = 0.03 + Math.random() * 0.06;
    ctx.fillStyle =
      Math.random() > 0.5
        ? `rgba(248, 250, 252, ${alpha})`
        : `rgba(15, 23, 42, ${alpha})`;
    ctx.fillRect(0, y, size, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createMatteEpoxyTexture(
  THREE: typeof THREEType,
  maxAnisotropy: number,
): THREEType.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Smooth matte architectural slate epoxy
  ctx.fillStyle = '#0E1420';
  ctx.fillRect(0, 0, size, size);

  // Subtle architectural concrete/epoxy tonal grain
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle =
      Math.random() > 0.5
        ? 'rgba(255,255,255,0.014)'
        : 'rgba(0,0,0,0.035)';
    ctx.fillRect(x, y, 3, 3);
  }

  // Faint cleanroom slab expansion seams (no busy grid lines)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.07)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 8);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createTestTrackTexture(
  THREE: typeof THREEType,
  maxAnisotropy: number,
): THREEType.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#141B29';
  ctx.fillRect(0, 0, w, h);

  // Subtle surface grain
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle =
      Math.random() > 0.5
        ? 'rgba(255,255,255,0.018)'
        : 'rgba(0,0,0,0.05)';
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 1);
  }

  // Restrained architectural shoulder lines
  ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.fillRect(0, 14, w, 2);
  ctx.fillRect(0, h - 16, w, 2);

  // Subtle dashed center calibration ticks
  ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
  for (let x = 16; x < w; x += 64) {
    ctx.fillRect(x, h / 2 - 1, 24, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(8, 1);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createWarningStripeTexture(
  THREE: typeof THREEType,
  maxAnisotropy: number,
): THREEType.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#EA580C';
  for (let i = -size; i < size * 2; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 14, 0);
    ctx.lineTo(i - size + 14, size);
    ctx.lineTo(i - size, size);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRadialShadowTexture(THREE: typeof THREEType): THREEType.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.5,
  );
  grad.addColorStop(0, 'rgba(3, 6, 12, 0.72)');
  grad.addColorStop(0.55, 'rgba(3, 6, 12, 0.34)');
  grad.addColorStop(1, 'rgba(3, 6, 12, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createRoboticsMaterials(
  THREE: typeof THREEType,
  maxAnisotropy: number,
): RoboticsMaterialSet {
  const brushedTex = createBrushedMetalTexture(THREE, maxAnisotropy);
  const epoxyTex = createMatteEpoxyTexture(THREE, maxAnisotropy);
  const trackTex = createTestTrackTexture(THREE, maxAnisotropy);
  const stripeTex = createWarningStripeTexture(THREE, maxAnisotropy);
  const shadowTex = createRadialShadowTexture(THREE);

  const textures = [brushedTex, epoxyTex, trackTex, stripeTex, shadowTex];

  // Matte dark composite shells (roughness: 0.65, metalness: 0.2)
  const matteComposite = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.65,
    metalness: 0.2,
  });

  // Cleanroom white industrial armor/casing with physical clearcoat finish
  const cleanroomWhite = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    roughness: 0.34,
    metalness: 0.12,
    clearcoat: 0.85,
    clearcoatRoughness: 0.16,
  });

  // Machined brushed steel / titanium joints (roughness: 0.25, metalness: 0.9)
  const machinedSteel = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: brushedTex,
    roughness: 0.25,
    metalness: 0.9,
  });

  const darkAnodized = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.38,
    metalness: 0.78,
  });

  // Glossy black tinted sensor glass (roughness: 0.05, metalness: 0.1, clearcoat: 1.0)
  const sensorGlass = new THREE.MeshPhysicalMaterial({
    color: 0x05080f,
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    ior: 1.52,
    reflectivity: 0.95,
  });

  const rubberTire = new THREE.MeshStandardMaterial({
    color: 0x161922,
    roughness: 0.85,
    metalness: 0.05,
  });

  const corrugatedConduit = new THREE.MeshStandardMaterial({
    color: 0x171d28,
    roughness: 0.72,
    metalness: 0.12,
  });

  const epoxyFloor = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: epoxyTex,
    roughness: 0.58,
    metalness: 0.1,
  });

  const testTrackSurface = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: trackTex,
    roughness: 0.62,
    metalness: 0.12,
  });

  const warningStripe = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: stripeTex,
    roughness: 0.5,
    metalness: 0.15,
  });

  const wallConcrete = new THREE.MeshStandardMaterial({
    color: 0x141b29,
    roughness: 0.78,
    metalness: 0.08,
  });

  // Soft overhead architectural light panels
  const lightPanel = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xe2e8f0,
    emissiveIntensity: 1.05,
    roughness: 0.3,
    metalness: 0.0,
  });

  // Restrained engineering accents strictly for actuator rings & status markers
  const accentOrange = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.35,
    metalness: 0.35,
  });

  const accentBlue = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.32,
    metalness: 0.4,
  });

  const accentIndigo = new THREE.MeshStandardMaterial({
    color: 0x6d28d9,
    roughness: 0.32,
    metalness: 0.4,
  });

  const statusStrip = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    emissive: 0x2563eb,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.1,
  });

  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.68,
  });

  const allMats = [
    matteComposite,
    cleanroomWhite,
    machinedSteel,
    darkAnodized,
    sensorGlass,
    rubberTire,
    corrugatedConduit,
    epoxyFloor,
    testTrackSurface,
    warningStripe,
    wallConcrete,
    lightPanel,
    accentOrange,
    accentBlue,
    accentIndigo,
    statusStrip,
    contactShadowMat,
  ];

  return {
    matteComposite,
    cleanroomWhite,
    machinedSteel,
    darkAnodized,
    sensorGlass,
    rubberTire,
    corrugatedConduit,
    epoxyFloor,
    testTrackSurface,
    warningStripe,
    wallConcrete,
    lightPanel,
    accentOrange,
    accentBlue,
    accentIndigo,
    statusStrip,
    contactShadowMat,
    dispose: () => {
      textures.forEach((t) => t.dispose());
      allMats.forEach((m) => m.dispose());
    },
  };
}
