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
  /** Brand colour behind the member's initials. */
  color: string;
  profiles: Record<ProfileNetwork, string>;
};

export const TEAM = [
  {
    name: "Nouman Ejaz",
    role: "Founder",
    color: "#10B23F",
    profiles: {
      github: "https://github.com/Nouman64-cat",
      linkedin: "https://www.linkedin.com/in/nouman-ejaz-64251125b/",
    },
  },
  {
    name: "Abdul Sammad",
    role: "Co-founder",
    color: "#FAD705",
    profiles: {
      github: "https://github.com/abdulsammad2004",
      linkedin: "https://www.linkedin.com/in/abdul-sammad-b90b9b218/",
    },
  },
  {
    name: "Arslan Amjad",
    role: "Co-founder",
    color: "#FD8AB9",
    profiles: {
      github: "https://github.com/thenewapple2004-netizen",
      linkedin: "https://www.linkedin.com/in/arslan-amjad-a25291282/",
    },
  },
  {
    name: "Ammar Baig",
    role: "Co-founder",
    color: "#A7B8FF",
    profiles: {
      github: "https://github.com/ammarbaig89",
      linkedin: "https://www.linkedin.com/in/ammarbaig89/",
    },
  },
] as const satisfies readonly TeamMember[];

/** "Nouman Ejaz" -> "NE". Derived so initials can never drift from the name. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
