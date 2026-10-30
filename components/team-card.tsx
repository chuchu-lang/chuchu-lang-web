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

/** Portrait card with a frosted identity panel and direct profile links. */
export default function TeamCard({ member }: TeamCardProps) {
  const isFounder = member.role === "Founder";

  return (
    <li
      className={`about-team-card${isFounder ? " about-team-card-founder" : ""}`}
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

      <div className="about-team-details">
        <div className="about-team-id">
          <h3 className="about-team-name">
            <span>{member.name}</span>
            <svg className="about-team-check" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="m16 1 4 2.6 4.8.5 1.5 4.6 3.6 3.3-1 4.8 1 4.8-3.6 3.3-1.5 4.6-4.8.5L16 32l-4-2.6-4.8-.5-1.5-4.6-3.6-3.3 1-4.8-1-4.8 3.6-3.3 1.5-4.6 4.8-.5Z" />
              <path d="m10.5 16 3.5 3.5 7.5-7.5" fill="none" stroke="#103d1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </h3>
          <p className="about-team-role">
            <span className="about-team-role-dot" aria-hidden="true" />
            {member.role}
          </p>
          <p className="about-team-tagline">{member.tagline}</p>
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
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
