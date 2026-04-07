export type SphereCategory = "Project" | "Experience" | "Club" | "Social";

export interface HeroCopy {
  kicker: string;
  headline: string;
  aside: string;
  subline: string;
}

export interface SphereNode {
  id: string;
  label: string;
  category: SphereCategory;
  href: string;
  iconSrc?: string;
  color?: string;
  ringColor?: string;
  anchorIndex: number;
}

export interface ContactInfo {
  displayEmail: string;
  recipientEmail: string;
  location: string;
}

export interface HeroPlanetLink {
  id: string;
  label: string;
  href: string;
  modelPath: string;
  description: string;
  scale?: number;
}

