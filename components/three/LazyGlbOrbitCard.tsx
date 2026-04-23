"use client";

import { type GlbOrbitCardProps } from "@/components/three/GlbOrbitCard";
import dynamic from "next/dynamic";

const GlbOrbitCard = dynamic(
  () => import("@/components/three/GlbOrbitCard").then((module) => module.GlbOrbitCard),
  { ssr: false }
);

export function LazyGlbOrbitCard(props: GlbOrbitCardProps) {
  return <GlbOrbitCard {...props} />;
}
