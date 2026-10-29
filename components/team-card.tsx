import type { ComponentType, CSSProperties } from "react";
import { GitHubIcon, LinkedInIcon } from "@/components/social-icons";
import { initialsOf, type ProfileNetwork, type TeamMember } from "@/lib/team";

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
 * One person on the About page: initials, name, role and profile links.
 * Every card carries the conic-gradient border that spins on hover; the
 * founder's card highlights the role badge in the brand green.
 */
export default function TeamCard({ member }: TeamCardProps) {
  const isFounder = member.role === "Founder";

  return (
    <li
      className={`glass card about-team-card${isFounder ? " about-team-card-founder" : ""}`}
      style={{ "--member": member.color } as Vars}
    >
      <span className="about-team-initials" aria-hidden="true">
        {initialsOf(member.name)}
      </span>

      <div className="about-team-id">
        <h3 className="about-team-name">{member.name}</h3>
        <p className="about-team-role">
          <span className="about-team-role-dot" aria-hidden="true" />
          {member.role}
        </p>
      </div>

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
    </li>
  );
}

