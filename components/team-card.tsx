import type { ComponentType, CSSProperties } from "react";
import Image from "next/image";
import { GitHubIcon, LinkedInIcon } from "@/components/social-icons";
import type { ProfileNetwork, TeamMember } from "@/lib/team";

// Lets style objects carry CSS custom properties like --member.
type Vars = CSSProperties & Record<`--${string}`, string>;

type Network = {
  key: ProfileNetwork;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

/** Profile links in display order. Adding a network is one entry here. */
const NETWORKS: readonly Network[] = [
  { key: "github", label: "GitHub", Icon: GitHubIcon },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
];

type TeamCardProps = {
  member: TeamMember;
};

/**
 * Portrait team card: full-bleed photo with a progressive bottom frosted-glass
 * blur, top-right social icons, and a bottom name/role overlay.
 */
export default function TeamCard({ member }: TeamCardProps) {
  const isFounder = member.role === "Founder";

  return (
    <li
      className={`glass card about-team-card${isFounder ? " about-team-card-founder" : ""}`}
      style={{ "--member": member.color } as Vars}
    >
      <div className="about-team-media">
        <Image
          className="about-team-photo"
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 280px"
        />
      </div>

      {/* Progressive frosted-glass blur over the bottom of the portrait */}
      <div className="about-team-glass" aria-hidden="true" />

      {/* Top-right GitHub & LinkedIn icons */}
      <ul className="about-team-socials" aria-label={`${member.name}'s profiles`}>
        {NETWORKS.map(({ key, label, Icon }) => (
          <li key={key}>
            <a
              className={`about-team-social about-team-social-${key}`}
              href={member.profiles[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on ${label} (opens in a new tab)`}
            >
              <Icon className="about-team-social-icon" />
            </a>
          </li>
        ))}
      </ul>

      {/* Bottom name & designation */}
      <div className="about-team-id">
        <h3 className="about-team-name">{member.name}</h3>
        <p className="about-team-role">
          <span className="about-team-role-dot" aria-hidden="true" />
          {member.role}
        </p>
      </div>
    </li>
  );
}
