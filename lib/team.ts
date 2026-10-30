/**
 * The people behind Chuchu.
 *
 * Single source of truth for the team: the About page cards and the
 * schema.org `founder` entries both derive from this list, so a name, role
 * or profile only ever has to change here.
 */

export type TeamRole = "Founder" | "Co-founder";

/** Profile networks a member can link to, in display order. */
export type ProfileNetwork = "github" | "linkedin";

export type TeamMember = {
  name: string;
  role: TeamRole;
  tagline: string;
  /** Brand colour for the member's role dot. */
  color: string;
  /** Portrait path under `public/`. */
  image: string;
  profiles: Record<ProfileNetwork, string>;
};

export const TEAM = [
  {
    name: "Nouman Ejaz",
    tagline: "Turning a language idea into native code.",
    role: "Founder",
    color: "#10B23F",
    image: "/team/nouman-ejaz.jpg",
    profiles: {
      github: "https://github.com/Nouman64-cat",
      linkedin: "https://www.linkedin.com/in/nouman-ejaz-64251125b/",
    },
  },
  {
    name: "Abdul Sammad",
    tagline: "Making complex ideas feel simple.",
    role: "Co-founder",
    color: "#FAD705",
    image: "/team/abdul-sammad-bw-white.png",
    profiles: {
      github: "https://github.com/abdulsammad2004",
      linkedin: "https://www.linkedin.com/in/abdul-sammad-b90b9b218/",
    },
  },
  {
    name: "Arslan Amjad",
    tagline: "Curiosity in every line of code.",
    role: "Co-founder",
    color: "#FD8AB9",
    image: "/team/arslan-amjad.jpg",
    profiles: {
      github: "https://github.com/thenewapple2004-netizen",
      linkedin: "https://www.linkedin.com/in/arslan-amjad-a25291282/",
    },
  },
  {
    name: "Ammar Baig",
    tagline: "Building what comes next, together.",
    role: "Co-founder",
    color: "#A7B8FF",
    image: "/team/ammar-baig-bw-white.png",
    profiles: {
      github: "https://github.com/ammarbaig89",
      linkedin: "https://www.linkedin.com/in/ammarbaig89/",
    },
  },
] as const satisfies readonly TeamMember[];
