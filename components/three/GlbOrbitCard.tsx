"use client";

import { Environment, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { SkeletonUtils } from "three-stdlib";
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

interface GlbOrbitCardProps {
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
  // Skinned GLBs need SkeletonUtils cloning to preserve bone bindings.
  const clone = hasSkinnedMesh(scene) ? SkeletonUtils.clone(scene) : scene.clone(true);

  clone.traverse((node) => {
    const skinnedNode = node as SkinnedMesh;
    if (!skinnedNode.isSkinnedMesh) {
      return;
    }

    // Avoid stale skin bounds causing incorrect culling/fitting.
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
  // Create a pivot wrapper - the clone sits inside it, offset so the
  // bounding-box center aligns with the pivot's origin.  Rotation of
  // the pivot then spins the model around its visual center.
  const pivot = new Object3D();

  const clone = cloneForPreview(scene);

  // Reset any root-level transforms the GLB file might carry.
  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  clone.scale.set(1, 1, 1);
  clone.updateWorldMatrix(true, true);

  // Measure bounding-box center in world space.
  const bbox = computeRenderableBounds(clone);
  const center = bbox.getCenter(new Vector3());
  if (!Number.isFinite(center.x)) center.set(0, 0, 0);

  // Offset the clone inside the pivot so geometry is centered at origin.
  clone.position.set(-center.x, -center.y, -center.z);
  pivot.add(clone);
  pivot.updateWorldMatrix(true, true);

  // Measure the radius from the pivot origin.
  const bboxAfter = computeRenderableBounds(pivot);
  const sphere = new Sphere();
  bboxAfter.getBoundingSphere(sphere);
  let initialRadius = sphere.radius;
  
  if (!Number.isFinite(initialRadius) || initialRadius < 1e-5 || initialRadius > 100000) {
    initialRadius = 1; // Fallback for broken bounding boxes
  }

  // Scale the entire pivot to fit the target radius.
  const targetRadius = 1.05;
  const uniformScale = (targetRadius / initialRadius) * scale;
  pivot.scale.set(uniformScale, uniformScale, uniformScale);
  pivot.updateWorldMatrix(true, true);

  // Optional: Remove any forced materials that could mess with PBR.
  // Re-measure after final scale.
  const finalBbox = computeRenderableBounds(pivot);
  const finalSphere = new Sphere();
  finalBbox.getBoundingSphere(finalSphere);
  let finalRadius = finalSphere.radius;
  if (!Number.isFinite(finalRadius) || finalRadius < 1e-5) finalRadius = targetRadius * scale;

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

    cam.position.set(0, 0, distance);
    cam.near = Math.max(0.01, distance - radius * 6);
    cam.far = distance + radius * 10;
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
  const isRb16 = modelPath.includes("rb16");
  const isShiverburn = modelPath.includes("shiverburn");
  const isBonefin = modelPath.includes("bonefin");

  const finalScale = (isRb16 ? scale : scale * 1.8) * (isBonefin ? 20 : 1);
  const { scene } = useGLTF(modelPath);
  const prepared = useMemo(() => prepareModel(scene, finalScale), [scene, finalScale]);

  const containerRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<PointerPoint | null>(null);
  const pointerLastRef = useRef<PointerPoint | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const pointerTypeRef = useRef<string | null>(null);
  const draggingRef = useRef(false);
  const rotationTargetRef = useRef<RotationTarget>({
    x: isShiverburn ? Math.PI / 6 : isBonefin ? Math.PI / 9 : 0,
    y: 0 
  });
  const [isVisible, setIsVisible] = useState(false);

  const resetPointerState = () => {
    draggingRef.current = false;
    pointerStartRef.current = null;
    pointerLastRef.current = null;
    activePointerIdRef.current = null;
    pointerTypeRef.current = null;
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { root: null, rootMargin: "0px 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== null) {
      return;
    }

    activePointerIdRef.current = event.pointerId;
    pointerTypeRef.current = event.pointerType;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    pointerLastRef.current = { x: event.clientX, y: event.clientY };
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.pointerType === "touch") {
      event.preventDefault();
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (
      !draggingRef.current ||
      !pointerLastRef.current ||
      activePointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    if (pointerTypeRef.current === "touch") {
      event.preventDefault();
    }

    const dx = event.clientX - pointerLastRef.current.x;
    const dy = event.clientY - pointerLastRef.current.y;

    pointerLastRef.current = { x: event.clientX, y: event.clientY };

    const isTouch = pointerTypeRef.current === "touch";
    const yawSensitivity = isTouch ? 0.016 : 0.009;
    const pitchSensitivity = isTouch ? 0.014 : 0.008;

    rotationTargetRef.current.y += dx * yawSensitivity;
    rotationTargetRef.current.x = clamp(rotationTargetRef.current.x + dy * pitchSensitivity, -0.9, 0.9);
  };

  const endPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
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
  };

  return (
    <button
      ref={containerRef}
      type="button"
      aria-label={ariaLabel ?? label}
      className={`group relative flex touch-none flex-col items-center justify-center text-center ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointer}
      onPointerCancel={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        resetPointerState();
      }}
      onLostPointerCapture={() => {
        resetPointerState();
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onActivate) {
          event.preventDefault();
          onActivate();
        }
      }}
    >
      <div className="relative aspect-square h-full max-h-full max-w-full overflow-visible transition-transform duration-300 group-hover:scale-[1.02]">
        {isVisible ? (
          <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 3.4], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <FitCamera radius={prepared.radius} />
            <ambientLight intensity={1.25} />
            <Environment preset="city" />
            <hemisphereLight intensity={0.85} groundColor="#131a32" />
            <directionalLight intensity={1.35} position={[2.4, 2.8, 2.9]} />
            <directionalLight intensity={0.66} position={[-2.3, -1.7, -2.4]} />
            <Suspense fallback={null}>
              <GlbModel
                prepared={prepared}
                autoRotateSpeed={autoRotateSpeed}
                rotationTargetRef={rotationTargetRef}
                draggingRef={draggingRef}
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
