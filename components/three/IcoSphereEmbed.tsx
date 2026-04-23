"use client";

import type { SphereNode } from "@/lib/types";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";

interface IcoSphereEmbedProps {
  nodes: readonly SphereNode[];
  onHoverNodeChange?: (node: SphereNode | null) => void;
}

type MappedNode = SphereNode & {
  position: THREE.Vector3;
};

type ScreenPosition = {
  id: string;
  screenX: number;
  screenY: number;
  visible: boolean;
};

function hexToRgb(hex: string) {
  const cleaned = hex.trim();
  const full =
    cleaned.length === 4
      ? `#${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}${cleaned[3]}${cleaned[3]}`
      : cleaned;

  const match = full.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) {
    return null;
  }

  const value = match[1];
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}

function getReadableTextColor(backgroundHex: string) {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) {
    return "#ffffff";
  }

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.62 ? "#111827" : "#ffffff";
}

function getUniqueVertices(geometry: THREE.IcosahedronGeometry): THREE.Vector3[] {
  const positionAttribute = geometry.attributes.position;
  const unique = new Map<string, THREE.Vector3>();

  for (let index = 0; index < positionAttribute.count; index += 1) {
    const vertex = new THREE.Vector3(
      positionAttribute.getX(index),
      positionAttribute.getY(index),
      positionAttribute.getZ(index)
    );
    const key = `${vertex.x.toFixed(4)}:${vertex.y.toFixed(4)}:${vertex.z.toFixed(4)}`;
    if (!unique.has(key)) {
      unique.set(key, vertex);
    }
  }

  return Array.from(unique.values());
}

function mapNodesEvenly(nodes: readonly SphereNode[], vertices: THREE.Vector3[]): MappedNode[] {
  if (nodes.length === 0 || vertices.length === 0) {
    return [];
  }

  const usedVertexIndices = new Set<number>();
  const normalizedVertices = vertices.map((vertex) => vertex.clone().normalize());
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return nodes.map((node, nodeIndex) => {
    const t = (nodeIndex + 0.5) / nodes.length;
    const y = 1 - t * 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * nodeIndex;
    const target = new THREE.Vector3(Math.cos(theta) * ringRadius, y, Math.sin(theta) * ringRadius);

    let bestVertexIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let vertexIndex = 0; vertexIndex < normalizedVertices.length; vertexIndex += 1) {
      if (usedVertexIndices.has(vertexIndex)) {
        continue;
      }

      const distance = target.distanceToSquared(normalizedVertices[vertexIndex]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestVertexIndex = vertexIndex;
      }
    }

    if (bestVertexIndex < 0) {
      bestVertexIndex = node.anchorIndex % vertices.length;
    }

    usedVertexIndices.add(bestVertexIndex);

    return {
      ...node,
      position: vertices[bestVertexIndex]
    };
  });
}

interface SceneProps {
  nodes: readonly SphereNode[];
  hoveredId: string | null;
  onHoverNode: (id: string | null) => void;
  onClickNode: (node: SphereNode) => void;
  canvasEl: HTMLCanvasElement | null;
  onScreenPosition: (position: ScreenPosition | null) => void;
}

function Scene({
  nodes,
  hoveredId,
  onHoverNode,
  onClickNode,
  canvasEl,
  onScreenPosition
}: SceneProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();

  const baseGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.2, 1), []);
  const wireframeGeometry = useMemo(() => new THREE.WireframeGeometry(baseGeometry), [baseGeometry]);
  const vertices = useMemo(() => getUniqueVertices(baseGeometry), [baseGeometry]);
  const verticesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const values = new Float32Array(vertices.length * 3);
    vertices.forEach((vertex, index) => {
      values[index * 3] = vertex.x;
      values[index * 3 + 1] = vertex.y;
      values[index * 3 + 2] = vertex.z;
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(values, 3));
    return geometry;
  }, [vertices]);

  const mappedNodes = useMemo(() => mapNodesEvenly(nodes, vertices), [nodes, vertices]);
  const mappedNodeById = useMemo(() => {
    const map = new Map<string, MappedNode>();
    for (const node of mappedNodes) {
      map.set(node.id, node);
    }
    return map;
  }, [mappedNodes]);

  const worldNodePos = useMemo(() => new THREE.Vector3(), []);
  const cameraDir = useMemo(() => new THREE.Vector3(), []);
  const worldCenter = useMemo(() => new THREE.Vector3(), []);
  const nodeDirection = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    return () => {
      baseGeometry.dispose();
      wireframeGeometry.dispose();
      verticesGeometry.dispose();
    };
  }, [baseGeometry, verticesGeometry, wireframeGeometry]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    group.rotation.y += delta * 0.03;

    if (!canvasEl || !hoveredId) {
      return;
    }

    const hoveredNode = mappedNodeById.get(hoveredId);
    if (!hoveredNode) {
      return;
    }

    const rect = canvasEl.getBoundingClientRect();

    worldNodePos.copy(hoveredNode.position);
    group.localToWorld(worldNodePos);

    cameraDir.subVectors(camera.position, worldNodePos).normalize();
    worldCenter.setFromMatrixPosition(group.matrixWorld);
    nodeDirection.copy(worldNodePos).sub(worldCenter).normalize();
    const isFrontFacing = cameraDir.dot(nodeDirection) > 0.1;

    worldNodePos.project(camera);
    const ndcX = worldNodePos.x * 0.5 + 0.5;
    const ndcY = -worldNodePos.y * 0.5 + 0.5;

    onScreenPosition({
      id: hoveredNode.id,
      screenX: rect.left + ndcX * rect.width + window.scrollX,
      screenY: rect.top + ndcY * rect.height + window.scrollY,
      visible: isFrontFacing
    });
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={baseGeometry}>
        <meshStandardMaterial color="#fbfbf9" transparent opacity={0.45} roughness={0.95} metalness={0.02} />
      </mesh>
      <lineSegments geometry={wireframeGeometry}>
        <lineBasicMaterial color="#242424" transparent opacity={0.52} />
      </lineSegments>
      <points geometry={verticesGeometry}>
        <pointsMaterial color="#515151" size={0.03} sizeAttenuation />
      </points>
      {mappedNodes.map((node) => {
        const isHovered = hoveredId === node.id;
        const markerColor = node.color ?? "#525252";
        const markerRadius = isHovered ? 0.058 : 0.043;

        return (
          <group key={node.id} position={node.position}>
            <mesh
              onPointerOver={(event) => {
                event.stopPropagation();
                onHoverNode(node.id);
              }}
              onPointerOut={(event) => {
                event.stopPropagation();
                onHoverNode(null);
              }}
              onClick={(event) => {
                event.stopPropagation();
                onClickNode(node);
              }}
            >
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            {node.ringColor ? (
              <mesh>
                <sphereGeometry args={[markerRadius + 0.014, 24, 24]} />
                <meshStandardMaterial
                  color={node.ringColor}
                  emissive={isHovered ? node.ringColor : "#181818"}
                  emissiveIntensity={isHovered ? 0.35 : 0.08}
                  side={THREE.BackSide}
                />
              </mesh>
            ) : null}
            <mesh>
              <sphereGeometry args={[markerRadius, 24, 24]} />
              <meshStandardMaterial
                color={markerColor}
                emissive={isHovered ? markerColor : "#000000"}
                emissiveIntensity={isHovered ? 0.3 : 0.05}
              />
            </mesh>
          </group>
        );
      })}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.75}
        minPolarAngle={0.45}
        maxPolarAngle={Math.PI - 0.45}
      />
    </group>
  );
}

interface PopupProps {
  node: SphereNode;
  screenX: number;
  screenY: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function NodePopup({ node, screenX, screenY, onMouseEnter, onMouseLeave, onClick }: PopupProps) {
  const chipBackground = node.color ?? "#525252";
  const chipTextColor = getReadableTextColor(chipBackground);

  return createPortal(
    <div
      style={{
        position: "absolute",
        left: `${screenX}px`,
        top: `${screenY}px`,
        transform: "translate(-50%, -120%)",
        zIndex: 9999,
        pointerEvents: "auto"
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }}
        className="group flex cursor-pointer flex-col items-center outline-none"
        aria-label={`Open ${node.label}`}
      >
        <div
          className="overflow-hidden rounded-xl border-2 bg-white/95 shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 dark:bg-black/75"
          style={{ borderColor: node.color ?? "#525252" }}
        >
          {node.iconSrc ? (
            <img
              src={node.iconSrc}
              alt={node.label}
              className={
                node.id === "wisconsin-autonomous" ? "h-[72px] w-[120px] object-cover" : "h-[72px] w-[72px] object-cover"
              }
              style={
                node.id === "linkedin"
                  ? { objectPosition: "left center" }
                  : node.id === "amd"
                    ? { transform: "translateX(2px) scale(0.9)", transformOrigin: "center center" }
                    : undefined
              }
              draggable={false}
            />
          ) : (
            <div
              className="flex h-[72px] w-[72px] items-center justify-center text-lg font-bold"
              style={{ backgroundColor: chipBackground, color: chipTextColor }}
            >
              {node.label.charAt(0)}
            </div>
          )}
        </div>
        <div
          className="mt-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-center text-[10px] font-semibold tracking-wide shadow-sm"
          style={{ backgroundColor: chipBackground, color: chipTextColor }}
        >
          {node.label}
        </div>
      </button>
    </div>,
    document.body
  );
}

export function IcoSphereEmbed({ nodes, onHoverNodeChange }: IcoSphereEmbedProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [screenPosition, setScreenPosition] = useState<ScreenPosition | null>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const cancelClear = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  }, []);

  const handleHoverNode = useCallback(
    (id: string | null) => {
      cancelClear();
      if (id) {
        setHoveredNodeId(id);
      } else {
        clearTimeoutRef.current = setTimeout(() => {
          setHoveredNodeId(null);
        }, 350);
      }
    },
    [cancelClear]
  );

  const handleClickNode = useCallback((node: SphereNode) => {
    if (node.href.startsWith("#")) {
      const target = document.querySelector(node.href);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.open(node.href, "_blank", "noopener,noreferrer");
  }, []);

  const positionRef = useRef<ScreenPosition | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleScreenPosition = useCallback((position: ScreenPosition | null) => {
    positionRef.current = position;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        setScreenPosition((previous) => {
          const next = positionRef.current;
          if (!previous || !next) {
            return next;
          }

          const isSamePosition =
            previous.id === next.id &&
            previous.visible === next.visible &&
            Math.abs(previous.screenX - next.screenX) < 0.5 &&
            Math.abs(previous.screenY - next.screenY) < 0.5;

          return isSamePosition ? previous : next;
        });
        rafRef.current = null;
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleCanvasCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    setCanvasEl(gl.domElement);
  }, []);

  const hoveredNode = nodes.find((node) => node.id === hoveredNodeId);
  const hoveredScreenPos = screenPosition && screenPosition.id === hoveredNodeId ? screenPosition : null;

  useEffect(() => {
    if (!onHoverNodeChange) {
      return;
    }
    onHoverNodeChange(hoveredNode ?? null);
  }, [hoveredNode, onHoverNodeChange]);

  useEffect(() => {
    if (!hoveredNodeId) {
      setScreenPosition(null);
    }
  }, [hoveredNodeId]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 overflow-hidden rounded-full bg-white/64 shadow-soft-line dark:bg-white/[0.06]">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4.1], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={handleCanvasCreated}
        >
          <ambientLight intensity={0.78} />
          <directionalLight intensity={0.82} position={[3, 3, 4]} />
          <directionalLight intensity={0.38} position={[-3, -2, -4]} />
          <Scene
            nodes={nodes}
            hoveredId={hoveredNodeId}
            onHoverNode={handleHoverNode}
            onClickNode={handleClickNode}
            canvasEl={canvasEl}
            onScreenPosition={handleScreenPosition}
          />
        </Canvas>
      </div>

      {mounted && hoveredNode && hoveredScreenPos && hoveredScreenPos.visible ? (
        <NodePopup
          node={hoveredNode}
          screenX={hoveredScreenPos.screenX}
          screenY={hoveredScreenPos.screenY}
          onMouseEnter={() => {
            cancelClear();
            setHoveredNodeId(hoveredNode.id);
          }}
          onMouseLeave={() => {
            clearTimeoutRef.current = setTimeout(() => {
              setHoveredNodeId(null);
            }, 350);
          }}
          onClick={() => handleClickNode(hoveredNode)}
        />
      ) : null}
    </div>
  );
}
