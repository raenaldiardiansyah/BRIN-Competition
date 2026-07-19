import { PrototypeEntry } from "@/components/prototype/prototype-entry";

const prototypeRoutes = [
  "explore",
  "design-system",
  "search",
  "projects/aqua-loop",
  "projects/cooling-preview",
  "projects/aqua-loop/manage",
  "projects/aqua-loop/contributions",
  "profiles/maya",
  "pricing",
  "register",
  "verify-email",
  "onboarding/goals",
  "onboarding/project-source",
  "onboarding/ai-review",
  "onboarding/first-value",
  "home",
  "me",
  "my-projects",
  "discovery",
  "matches/aqua-maya",
  "saved",
  "collaboration",
  "collaboration/new",
  "notifications",
  "settings/privacy",
  "subscription",
  "org/nusantara",
  "org/nusantara/profile",
  "org/nusantara/projects",
  "org/nusantara/search",
  "org/nusantara/shortlist",
  "org/nusantara/pipeline",
  "org/nusantara/members",
  "org/nusantara/subscription",
  "org/nexa-research-lab",
  "organization/nexa-research-lab",
  "organization/nexa-research-lab/profile",
  "organization/nexa-research-lab/projects",
  "organization/nexa-research-lab/search",
  "organization/nexa-research-lab/shortlist",
  "organization/nexa-research-lab/pipeline",
  "organization/nexa-research-lab/members",
  "organization/nexa-research-lab/subscription",
  "prototype-map",
  "opportunities/urban-heat",
];

export function generateStaticParams() {
  return prototypeRoutes.map((route) => ({ path: route.split("/") }));
}

export const dynamicParams = false;

export default function PrototypeCatchAllPage() {
  return <PrototypeEntry />;
}
