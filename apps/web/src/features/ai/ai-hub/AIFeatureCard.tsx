import Link from "next/link";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import type { AIFeature } from "../types";

export function AIFeatureCard({
  feature,
  selected,
  onSelect,
}: {
  feature: AIFeature;
  selected: boolean;
  onSelect: () => void;
}) {
  const card = (
    <article className={`ai-feature-card${selected ? " selected" : ""}`}>
      <button type="button" onClick={onSelect} aria-pressed={selected}>
        <span>{feature.maturity === "mvp" ? "MVP utama" : "Advanced prototype"}</span>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
        <small>{feature.access.tiers.join(" · ")}</small>
      </button>
      <Link href={feature.route}>Buka fitur</Link>
    </article>
  );

  if (selected && feature.maturity === "mvp") {
    return (
      <SpotlightCard
        className="ai-feature-spotlight"
        spotlightColor="rgba(7, 95, 247, 0.16)"
      >
        {card}
      </SpotlightCard>
    );
  }

  return card;
}
