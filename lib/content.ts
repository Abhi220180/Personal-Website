import type { ContactInfo, HeroCopy, SphereNode } from "@/lib/types";

export const heroCopy: HeroCopy = {
  kicker: "Abhinav Gummadi - University of Wisconsin-Madison - CS + CE",
  headline: "Situational Curiosity: The Decade Ahead",
  aside:
    "I build across systems, software, and hardware, with a focus on intelligent tools that stay practical.",
  subline:
    "The landing composition is laid out in JavaScript with Pretext-style line flow and floating marks that influence text geometry."
};

export const heroTitleLines: string[] = [
  "Situational",
  "Curiosity:",
  "The Decade",
  "Ahead"
];

export const heroRightColumnLead: string[] = [
  "I am a CS + CE student at UW-Madison focused on intelligent systems, software architecture, and hardware-aware implementation.",
  "I like building things that feel technically rigorous but still deliberate to read and use. This page is an interactive editorial profile, not a template portfolio."
];

export const heroEssayParagraphs: string[] = [
  "Over the last few years, I have become interested in projects where the strongest work happens between categories. A systems problem can become a product problem. A hardware limit can become a design constraint. A UI detail can reveal whether an algorithm is useful in practice.",
  "At Wisconsin, Computer Science and Computer Engineering let me move across the full stack. I can work from implementation details and performance concerns to interaction flow and developer experience, then back to constraints that force better architecture.",
  "I enjoy building intelligent tools that improve decisions, not just automate clicks. That means thinking about data quality, retrieval behavior, uncertainty, and what a user should trust at each step.",
  "The projects and experiences linked throughout this site are snapshots of that direction: technical work across AI, systems, and hardware with an emphasis on craft, iteration speed, and clear communication."
];

export const bioParagraphs: string[] = [
  "I grew up attracted to the mechanics behind systems: why abstractions leak, how interfaces shape behavior, and where performance decisions quietly become product decisions.",
  "At UW-Madison, studying Computer Science and Computer Engineering gives me both languages: the software view where architecture and iteration matter, and the hardware view where timing, constraints, and physicality are impossible to ignore.",
  "Most of my work sits at intersections. I like projects where systems thinking, AI, and implementation detail all matter at once, whether that means writing core logic, building infra around it, or shipping a polished interface for other people to use.",
  "I am especially interested in intelligent tools that do not just automate tasks but improve decision quality. That often pushes me toward projects with retrieval, planning, human feedback loops, and careful evaluation beyond benchmark numbers.",
  "Outside coursework, I look for teams and clubs that treat engineering as a craft. I care about code quality, but also about communication, ownership, and the discipline of making complex work legible to other people."
];

export const whatILikeParagraphs: string[] = [
  "I like building systems that feel precise. Sometimes that is a compiler-adjacent tool, sometimes an AI workflow, sometimes hardware-aware software where latency and memory are first-class constraints.",
  "I am drawn to technical creativity: turning difficult requirements into designs that still read clearly. The best projects, for me, are both rigorous and expressive.",
  "Long term, I want to work on products where systems engineering, machine intelligence, and thoughtful interaction design come together in a way that is useful, trustworthy, and durable."
];

export const sphereNodes: SphereNode[] = [
  {
    id: "nova",
    label: "NOVA",
    category: "Project",
    href: "https://nova-utd.github.io/",
    iconSrc: "/images/nodes/nova.jpg",
    color: "#e87b1e",
    anchorIndex: 5
  },
  {
    id: "wisconsin-autonomous",
    label: "Wisconsin Autonomous",
    category: "Club",
    href: "https://wa.wisc.edu/",
    iconSrc: "/images/nodes/wisconsin-autonomous.jpg",
    color: "#c5050c",
    anchorIndex: 12
  },
  {
    id: "black-hole-engine",
    label: "Black Hole Engine",
    category: "Project",
    href: "https://github.com/Abhi220180/Black-Hole-Engine",
    iconSrc: "/images/nodes/black-hole-engine.png",
    color: "#080808",
    ringColor: "#ff7a00",
    anchorIndex: 33
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    category: "Social",
    href: "https://www.linkedin.com/in/abhinavgummadi/",
    iconSrc: "/images/nodes/linkedin.png",
    color: "#0a66c2",
    anchorIndex: 45
  },
  {
    id: "github",
    label: "GitHub",
    category: "Social",
    href: "https://github.com/Abhi220180",
    iconSrc: "/images/nodes/github.png",
    color: "#6f42c1",
    anchorIndex: 57
  }
];

export const contactInfo: ContactInfo = {
  displayEmail: "abhinavg@example.com",
  recipientEmail: "abhinavg@example.com",
  location: "Madison, Wisconsin"
};
