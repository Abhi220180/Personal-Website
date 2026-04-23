"use client";

import { Environment } from "@react-three/drei/core/Environment";
import { useGLTF } from "@react-three/drei/core/Gltf";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
  type PointerEvent
} from "react";
import {
  Box3,
  MathUtils,
  Object3D,
  PerspectiveCamera,
  SkinnedMesh,
  Sphere,
  Vector3,
  type Group
} from "three";
import { SkeletonUtils } from "three-stdlib";

type PointerPoint = {
  x: number;
  y: number;
};

type RotationTarget = {
  x: number;
  y: number;
};

type PreparedModel = {
  object: Object3D;
  radius: number;
};

interface GlbModelProps {
  prepared: PreparedModel;
  autoRotateSpeed: number;
  rotationTargetRef: MutableRefObject<RotationTarget>;
  draggingRef: MutableRefObject<boolean>;
}

interface FitCameraProps {
  radius: number;
}

interface GlbSceneProps {
  modelPath: string;
  scale: number;
  autoRotateSpeed: number;
  rotationTargetRef: MutableRefObject<RotationTarget>;
  draggingRef: MutableRefObject<boolean>;
  isLowMemoryMode: boolean;
}

export interface GlbOrbitCardProps {
  modelPath: string;
  label: string;
  subtitle?: string;
  showLabel?: boolean;
  scale?: number;
  autoRotateSpeed?: number;
  className?: string;
  onActivate?: () => void;
  ariaLabel?: string;
}

const LARGE_MODEL_SCALE_FACTOR = 20;
const VISIBILITY_OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "0px 0px",
  threshold: 0.15
};
const NEAR_VIEWPORT_OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "220px 0px",
  threshold: 0.01
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hasSkinnedMesh(object: Object3D) {
  let hasSkin = false;

  object.traverse((node) => {
    if ((node as { isSkinnedMesh?: boolean }).isSkinnedMesh) {
      hasSkin = true;
    }
  });

  return hasSkin;
}

function cloneForPreview(scene: Object3D) {
  const clone = hasSkinnedMesh(scene) ? SkeletonUtils.clone(scene) : scene.clone(true);

  clone.traverse((node) => {
    const skinnedNode = node as SkinnedMesh;
    if (!skinnedNode.isSkinnedMesh) {
      return;
    }

    skinnedNode.frustumCulled = false;
    skinnedNode.skeleton.update();
  });

  return clone;
}

function computeRenderableBounds(object: Object3D) {
  const bounds = new Box3();
  const tmpBounds = new Box3();
  let hasMeshBounds = false;

  object.updateWorldMatrix(true, true);

  object.traverse((node) => {
    if (!(node as { isMesh?: boolean }).isMesh) {
      return;
    }

    tmpBounds.setFromObject(node, true);
    if (tmpBounds.isEmpty()) {
      return;
    }

    if (!hasMeshBounds) {
      bounds.copy(tmpBounds);
      hasMeshBounds = true;
      return;
    }

    bounds.union(tmpBounds);
  });

  if (!hasMeshBounds) {
    bounds.setFromObject(object, true);
  }

  return bounds;
}

function prepareModel(scene: Object3D, scale: number): PreparedModel {
  const pivot = new Object3D();
  const clone = cloneForPreview(scene);

  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  clone.scale.set(1, 1, 1);
  clone.updateWorldMatrix(true, true);

  const bbox = computeRenderableBounds(clone);
  const center = bbox.getCenter(new Vector3());
  if (!Number.isFinite(center.x)) {
    center.set(0, 0, 0);
  }

  clone.position.set(-center.x, -center.y, -center.z);
  pivot.add(clone);
  pivot.updateWorldMatrix(true, true);

  const bboxAfter = computeRenderableBounds(pivot);
  const sphere = new Sphere();
  bboxAfter.getBoundingSphere(sphere);
  let initialRadius = sphere.radius;

  if (!Number.isFinite(initialRadius) || initialRadius < 1e-5 || initialRadius > 100000) {
    initialRadius = 1;
  }

  const targetRadius = 1.05;
  const uniformScale = (targetRadius / initialRadius) * scale;
  pivot.scale.set(uniformScale, uniformScale, uniformScale);
  pivot.updateWorldMatrix(true, true);

  const finalBbox = computeRenderableBounds(pivot);
  const finalSphere = new Sphere();
  finalBbox.getBoundingSphere(finalSphere);
  let finalRadius = finalSphere.radius;
  if (!Number.isFinite(finalRadius) || finalRadius < 1e-5) {
    finalRadius = targetRadius * scale;
  }

  return {
    object: pivot,
    radius: Number.isFinite(finalRadius) && finalRadius > 1e-4 ? finalRadius : targetRadius * scale
  };
}

function FitCamera({ radius }: FitCameraProps) {
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const fovRad = (cam.fov * Math.PI) / 180;
    const distance = (radius * 1.15) / Math.tan(fovRad * 0.5);
    const nearPlane = Math.max(0.08, distance - radius * 1.8);
    const farPlane = distance + radius * 2.6;

    cam.position.set(0, 0, distance);
    cam.near = Math.min(nearPlane, Math.max(0.08, distance - 0.05));
    cam.far = Math.max(farPlane, cam.near + 1);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, radius]);

  return null;
}

function GlbModel({ prepared, autoRotateSpeed, rotationTargetRef, draggingRef }: GlbModelProps) {
  const rootRef = useRef<Group | null>(null);

  useFrame((_state, delta) => {
    if (!rootRef.current) {
      return;
    }

    if (!draggingRef.current) {
      rotationTargetRef.current.y += delta * autoRotateSpeed;
    }

    rootRef.current.rotation.x = MathUtils.damp(
      rootRef.current.rotation.x,
      rotationTargetRef.current.x,
      11,
      delta
    );
    rootRef.current.rotation.y = MathUtils.damp(
      rootRef.current.rotation.y,
      rotationTargetRef.current.y,
      11,
      delta
    );
  });

  return (
    <group ref={rootRef}>
      <primitive object={prepared.object} />
    </group>
  );
}

function Placeholder() {
  return (
    <div className="flex aspect-square h-full items-center justify-center rounded-[32px] text-[10px] uppercase tracking-[0.12em] text-white/80">
      Loading 3D
    </div>
  );
}

function GlbScene({
  modelPath,
  scale,
  autoRotateSpeed,
  rotationTargetRef,
  draggingRef,
  isLowMemoryMode
}: GlbSceneProps) {
  const { scene } = useGLTF(modelPath);
  const prepared = useMemo(() => prepareModel(scene, scale), [scene, scale]);

  return (
    <>
      <FitCamera radius={prepared.radius} />
      <ambientLight intensity={isLowMemoryMode ? 1.18 : 1.25} />
      {!isLowMemoryMode ? <Environment preset="city" /> : null}
      <hemisphereLight intensity={isLowMemoryMode ? 0.72 : 0.85} groundColor="#131a32" />
      <directionalLight intensity={isLowMemoryMode ? 1 : 1.35} position={[2.4, 2.8, 2.9]} />
      {!isLowMemoryMode ? <directionalLight intensity={0.66} position={[-2.3, -1.7, -2.4]} /> : null}
      <GlbModel
        prepared={prepared}
        autoRotateSpeed={autoRotateSpeed}
        rotationTargetRef={rotationTargetRef}
        draggingRef={draggingRef}
      />
    </>
  );
}

export function GlbOrbitCard({
  modelPath,
  label,
  subtitle,
  showLabel = true,
  scale = 1,
  autoRotateSpeed = 0.28,
  className = "",
  onActivate,
  ariaLabel
}: GlbOrbitCardProps) {
  const normalizedModelPath = modelPath.toLowerCase();
  const isRb16 = normalizedModelPath.includes("rb16");
  const isShiverburn = normalizedModelPath.includes("shiverburn");
  const needsLargeScaleCompensation = normalizedModelPath.includes("meltymonster");

  const finalScale =
    (isRb16 ? scale : scale * 1.8) * (needsLargeScaleCompensation ? LARGE_MODEL_SCALE_FACTOR : 1);

  const containerRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<PointerPoint | null>(null);
  const pointerLastRef = useRef<PointerPoint | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerTypeRef = useRef<string | null>(null);
  const draggingRef = useRef(false);
  const rotationTargetRef = useRef<RotationTarget>({
    x: isShiverburn ? Math.PI / 6 : needsLargeScaleCompensation ? Math.PI / 9 : 0,
    y: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isLowMemoryMode, setIsLowMemoryMode] = useState(false);

  const resetPointerState = useCallback(() => {
    draggingRef.current = false;
    pointerStartRef.current = null;
    pointerLastRef.current = null;
    activePointerIdRef.current = null;
    pointerTypeRef.current = null;
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const visibilityObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        setIsVisible(entry.isIntersecting);
      }
    }, VISIBILITY_OBSERVER_OPTIONS);
    const nearViewportObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        setIsNearViewport(entry.isIntersecting);
      }
    }, NEAR_VIEWPORT_OBSERVER_OPTIONS);

    visibilityObserver.observe(node);
    nearViewportObserver.observe(node);

    return () => {
      visibilityObserver.disconnect();
      nearViewportObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isNearViewport) {
      return;
    }
    useGLTF.preload(modelPath);
  }, [isNearViewport, modelPath]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const updateMode = () => setIsLowMemoryMode(mediaQuery.matches);

    updateMode();
    try {
      mediaQuery.addEventListener("change", updateMode);
      return () => mediaQuery.removeEventListener("change", updateMode);
    } catch {
      mediaQuery.addListener(updateMode);
      return () => mediaQuery.removeListener(updateMode);
    }
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== null) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    pointerTypeRef.current = event.pointerType;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    pointerLastRef.current = { x: event.clientX, y: event.clientY };
    draggingRef.current = true;

    // Let mobile browsers keep vertical page scrolling behavior.
    if (event.pointerType !== "touch") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}
    }
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (
      !draggingRef.current ||
      !pointerLastRef.current ||
      activePointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    // Avoid hijacking scroll gestures on touch devices.
    if (pointerTypeRef.current === "touch") {
      return;
    }

    const dx = event.clientX - pointerLastRef.current.x;
    const dy = event.clientY - pointerLastRef.current.y;

    pointerLastRef.current = { x: event.clientX, y: event.clientY };

    const isTouch = pointerTypeRef.current === "touch";
    const yawSensitivity = isTouch ? 0.016 : 0.009;
    const pitchSensitivity = isTouch ? 0.014 : 0.008;

    rotationTargetRef.current.y += dx * yawSensitivity;
    rotationTargetRef.current.x = clamp(
      rotationTargetRef.current.x + dy * pitchSensitivity,
      -0.9,
      0.9
    );
  }, []);

  const endPointer = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (!onActivate || !pointerStartRef.current) {
        resetPointerState();
        return;
      }

      const dx = event.clientX - pointerStartRef.current.x;
      const dy = event.clientY - pointerStartRef.current.y;
      const tapThreshold = pointerTypeRef.current === "touch" ? 16 : 7;

      if (Math.hypot(dx, dy) < tapThreshold) {
        onActivate();
      }

      resetPointerState();
    },
    [onActivate, resetPointerState]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      resetPointerState();
    },
    [resetPointerState]
  );

  const handleKeyboardActivate = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if ((event.key === "Enter" || event.key === " ") && onActivate) {
        event.preventDefault();
        onActivate();
      }
    },
    [onActivate]
  );

  const preloadModel = useCallback(() => {
    useGLTF.preload(modelPath);
  }, [modelPath]);

  return (
    <button
      ref={containerRef}
      type="button"
      aria-label={ariaLabel ?? label}
      className={`group relative flex touch-pan-y flex-col items-center justify-center text-center ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerEnter={preloadModel}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={resetPointerState}
      onKeyDown={handleKeyboardActivate}
      onFocus={preloadModel}
    >
      <div className="relative aspect-square h-full max-h-full max-w-full overflow-visible transition-transform duration-300 group-hover:scale-[1.02]">
        {isVisible ? (
          <Canvas
            dpr={isLowMemoryMode ? [0.75, 1] : [1, 1.6]}
            camera={{ position: [0, 0, 3.4], fov: 42 }}
            gl={{
              antialias: !isLowMemoryMode,
              alpha: true,
              logarithmicDepthBuffer: !isLowMemoryMode,
              powerPreference: isLowMemoryMode ? "low-power" : "high-performance"
            }}
          >
            <Suspense fallback={null}>
              <GlbScene
                modelPath={modelPath}
                scale={finalScale}
                autoRotateSpeed={autoRotateSpeed}
                rotationTargetRef={rotationTargetRef}
                draggingRef={draggingRef}
                isLowMemoryMode={isLowMemoryMode}
              />
            </Suspense>
          </Canvas>
        ) : (
          <Placeholder />
        )}
      </div>
      {showLabel ? (
        <div className="pointer-events-none mt-3 text-center">
          <p className="font-['Press_Start_2P'] text-[10px] uppercase tracking-[0.09em] text-white">{label}</p>
          {subtitle ? <p className="mt-1 text-xs text-white/80">{subtitle}</p> : null}
        </div>
      ) : null}
    </button>
  );
}
