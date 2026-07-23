"use client";

import Link from "next/link";
import { useReducedMotion } from "motion/react";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import type { AIFeature } from "../types";

const featureCta: Record<AIFeature["id"], string> = {
  "collaboration-matching": "Mulai pencocokan", "innovation-profile": "Analisis profil",
  "innovation-workspace": "Buka workspace", "research-gap": "Temukan gap riset",
  "novelty-checker": "Cek indikasi kebaruan", "industry-matching": "Lihat preview Organization",
  "funding-recommendation": "Lihat preview Organization", commercialization: "Lihat preview Organization",
};

export function AIFeatureCard({
  feature,
  selected,
  onSelect,
}: {
  feature: AIFeature;
  selected: boolean;
  onSelect: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const organizationOnly = feature.access.tiers.length === 1 && feature.access.tiers[0] === "organization";
  const card = (
    <article className={`ai-feature-card${selected ? " selected" : ""}`}>
      <button type="button" onClick={onSelect} aria-pressed={selected}>
        <span>{organizationOnly ? "Organization" : feature.maturity === "mvp" ? "MVP utama" : "Pro"}</span>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
        <small>{organizationOnly ? "Preview tersedia · akses penuh memerlukan workspace Organization" : "Termasuk dalam Pro Individual"}</small>
      </button>
      <Link href={feature.route}>{organizationOnly ? "Lihat preview Organization" : featureCta[feature.id]}</Link>
    </article>
  );

  if (selected && feature.maturity === "mvp" && !reducedMotion) {
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
