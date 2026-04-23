import type { HeroPlanetLink, SphereNode } from "@/lib/types";

export const heroNameLine = "Abhinav Gummadi";
export const heroSchoolLine = "CE + CS @ UW Madison";

export const modelPaths = {
  projects: "/models/shiverburn.glb",
  whoIAm: "/models/cosmic-cove.glb",
  experience: "/models/meltymonsterfinal.glb",
  rb16: "/models/rb16.glb",
  bonefin: "/models/bonefin.glb"
} as const;

export const heroPlanetLinks: readonly HeroPlanetLink[] = [
  {
    id: "shiverburn",
    label: "Projects",
    href: "/projects",
    modelPath: modelPaths.projects,
    description: "Things I built end-to-end.",
    scale: 1
  },
  {
    id: "cosmic-cove",
    label: "Who I Am",
    href: "/who-i-am",
    modelPath: modelPaths.whoIAm,
    description: "How I think and what I care about.",
    scale: 1
  },
  {
    id: "meltymonster",
    label: "Experience",
    href: "/experience",
    modelPath: modelPaths.experience,
    description: "Teams, clubs, and internships.",
    scale: 0.98
  }
];

export const allModelPaths = [
  modelPaths.projects,
  modelPaths.whoIAm,
  modelPaths.experience,
  modelPaths.rb16
] as const;

export const projectSphereNodes: readonly SphereNode[] = [
  {
    id: "black-hole-engine",
    label: "Black Hole Engine",
    category: "Project",
    href: "https://github.com/Abhi220180/Black-Hole-Engine.git",
    iconSrc: "/images/nodes/black-hole-engine.png",
    color: "#000000",
    ringColor: "#f97316",
    summary:
      "Built a graphics-heavy sandbox focused on simulation visuals and interactive rendering behavior.",
    highlights: [
      "C++ architecture and rendering pipeline work",
      "Interactive systems design and debugging",
      "Performance-focused engine iteration"
    ],
    anchorIndex: 4
  },
  {
    id: "personal-website",
    label: "Personal Website",
    category: "Project",
    href: "https://github.com/Abhi220180/Personal-Website.git",
    iconSrc: "/images/personalwebsiteicon.png",
    color: "#ef4444",
    ringColor: "#991b1b",
    summary:
      "Designed and shipped this interactive portfolio with custom 3D navigation and responsive editorial layout.",
    highlights: [
      "Next.js + TypeScript application structure",
      "React Three Fiber scene composition",
      "Frontend performance and caching optimization"
    ],
    anchorIndex: 12
  },
  {
    id: "f1-simulator-project",
    label: "F1 Simulator Project",
    category: "Project",
    href: "https://github.com/KushagraBharti/F1-ReinforcementLearning",
    iconSrc: "/images/nodes/Tsunoda_Red_Bull_041125.webp",
    color: "#1d4ed8",
    ringColor: "#dc2626",
    summary:
      "Contributed to a reinforcement-learning-based F1 simulator workflow with model training experimentation.",
    highlights: [
      "Python + ML experimentation pipeline",
      "Simulation environment integration",
      "Result analysis and iteration"
    ],
    anchorIndex: 8
  },
  {
    id: "github",
    label: "GitHub",
    category: "Project",
    href: "https://github.com/Abhi220180",
    iconSrc: "/images/githubicon.svg",
    color: "#a855f7",
    ringColor: "#581c87",
    summary: "Central profile for projects, code samples, and development activity history.",
    highlights: [
      "Version control workflow",
      "Project documentation and code organization",
      "Open-source collaboration habits"
    ],
    anchorIndex: 0
  }
];

export const experienceSphereNodes: readonly SphereNode[] = [
  {
    id: "nova",
    label: "NOVA",
    category: "Experience",
    roleName: "Vehicle Engineer",
    href: "https://nova-utd.github.io/",
    iconSrc: "/images/nodes/nova.jpg",
    color: "#f97316",
    ringColor: "#ea580c",
    summary:
      "Collaborated in a student engineering environment on hands-on technical initiatives and team execution.",
    highlights: [
      "Built CARLA-based pedestrian-detection workflows using LiDAR point-cloud data to support simulation-driven perception testing for NOVA's open-source self-driving platform",
      "Integrated an NVIDIA AGX compute module with ZED camera systems to enable onboard sensor processing and embedded perception workloads",
      "Used CUDA on NVIDIA hardware to support GPU-accelerated perception workloads in real-time autonomous driving experiments"
    ],
    anchorIndex: 4
  },
  {
    id: "wisconsin-autonomous",
    label: "Wisconsin Autonomous",
    category: "Experience",
    roleName: "Perception Developer/Engineer",
    href: "https://wa.wisc.edu/",
    iconSrc: "/images/nodes/wisconsin-autonomous.jpg",
    color: "#c5050c",
    ringColor: "#9b0000",
    summary:
      "Worked in autonomous systems-focused student projects, contributing to practical engineering tasks.",
    highlights: [
      "Trained an EfficientNet-based image classifier for traffic sign recognition, achieving 87% validation accuracy using BDD100K and internal data",
      "Built a two-stage perception pipeline for bounding-box detection and classification, achieving 83 ms camera-to-recognition latency",
      "Evaluated MATLAB/Simulink sim-to-real generalization across 1,000 images per class, finding only a 1.5% accuracy gap between simulated and real-world traffic sign data"
    ],
    anchorIndex: 8
  },
  {
    id: "amd",
    label: "AMD",
    category: "Experience",
    roleName: "Graduate Hardware Engineer Co-op",
    href: "https://www.amd.com/",
    iconSrc: "/images/nodes/AMD%20Logo.png",
    color: "#0b0b0f",
    ringColor: "#5aaeb5",
    summary: "Doing Design Verification on AMD Accelerators and Datacenter GPUs",
    highlights: ["Incoming Fall 2026"],
    anchorIndex: 12
  },
  {
    id: "ibm",
    label: "IBM",
    category: "Experience",
    roleName: "Physical Design Engineer Intern",
    href: "https://www.ibm.com/",
    iconSrc: "/images/nodes/IBM%20Logo.png",
    color: "#f8f9fb",
    ringColor: "#4a84be",
    summary: "Developing Silicon Interposer for AI Accelerators",
    highlights: ["Incoming Summer 2026"],
    anchorIndex: 16
  }
];

export const aboutParagraphs: readonly string[] = [
  "Hello,",
  "My name is Abhinav Gummadi. I am a 3rd year student at UW Madison studying Computer Science and Computer Engineering. Outside of academics & career, I love to sim race, have fun with friends, stargaze, ponder at art, and draw pieces of fashion. I also enjoy F1, playing single player video games, and watching animated shows (American and Japanese)."
];
