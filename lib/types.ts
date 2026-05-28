export type SphereCategory = "Project" | "Experience" | "Club" | "Social";

export interface SphereNode {
  id: string;
  label: string;
  category: SphereCategory;
  roleName?: string;
  href: string;
  iconSrc?: string;
  color?: string;
  ringColor?: string;
  summary?: string;
  highlights?: readonly string[];
  anchorIndex: number;
}

export interface HeroPlanetLink {
  id: string;
  label: string;
  href: string;
  modelPath: string;
  description: string;
  scale?: number;
}

export interface ContactInfo {
  displayEmail: string;
  recipientEmail: string;
  location: string;
}
