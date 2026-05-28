import type { ContactInfo, HeroPlanetLink } from "@/lib/types";

export const heroNameLine = "Abhinav Gummadi";
export const heroSchoolLine = "CE + CS @ UW Madison";

export const heroPlanetLinks: HeroPlanetLink[] = [
  {
    id: "shiverburn",
    label: "Projects",
    href: "/projects",
    modelPath: "/models/shiverburn.glb",
    description: "Things I built end-to-end.",
    scale: 1
  },
  {
    id: "cosmic-cove",
    label: "Who I Am",
    href: "/who-i-am",
    modelPath: "/models/cosmic-cove.glb",
    description: "How I think and what I care about.",
    scale: 1
  },
  {
    id: "bonefin",
    label: "Experience",
    href: "/experience",
    modelPath: "/models/bonefin.glb",
    description: "Teams, clubs, and internships.",
    scale: 0.98
  }
];

export const allModelPaths = [
  "/models/shiverburn.glb",
  "/models/cosmic-cove.glb",
  "/models/bonefin.glb",
  "/models/rb16.glb"
] as const;

export const aboutParagraphs: string[] = [
  "Hello,",
  "My name is Abhinav Gummadi. I am a 3rd year student at UW Madison studying Computer Science and Computer Engineering. Outside of academics & career, I love to sim race, have fun with friends, stargaze, ponder at art, and draw pieces of fashion. I also enjoy F1, playing single player video games, and watching animated shows (American and Japanese)."
];


export const contactInfo: ContactInfo = {
  displayEmail: "abhinavg@example.com",
  recipientEmail: "abhinavg@example.com",
  location: "Madison, Wisconsin"
};
