import type * as THREEType from 'three';
import type { RoomEnvironment as RoomEnvironmentType } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ThreeKit {
  THREE: typeof THREEType;
  RoomEnvironment: typeof RoomEnvironmentType;
  OrbitControls: typeof OrbitControlsType;
}

declare global {
  interface Window {
    __THREE_KIT__?: ThreeKit;
    __THREE_KIT_PROMISE__?: Promise<ThreeKit>;
  }
}

export async function loadThreeKit(): Promise<ThreeKit> {
  if (window.__THREE_KIT__) {
    return window.__THREE_KIT__;
  }
  if (window.__THREE_KIT_PROMISE__) {
    return window.__THREE_KIT_PROMISE__;
  }

  // Fallback dynamic CDN import if opened without inline script execution
  const cdnBase = 'https://cdn.jsdelivr.net/npm/three@0.170.0';
  const [THREE, envMod, controlsMod] = await Promise.all([
    import(/* @vite-ignore */ `${cdnBase}/build/three.module.js`),
    import(/* @vite-ignore */ `${cdnBase}/examples/jsm/environments/RoomEnvironment.js`),
    import(/* @vite-ignore */ `${cdnBase}/examples/jsm/controls/OrbitControls.js`),
  ]);

  const kit: ThreeKit = {
    THREE: THREE as typeof THREEType,
    RoomEnvironment: envMod.RoomEnvironment as typeof RoomEnvironmentType,
    OrbitControls: controlsMod.OrbitControls as typeof OrbitControlsType,
  };
  window.__THREE_KIT__ = kit;
  return kit;
}
