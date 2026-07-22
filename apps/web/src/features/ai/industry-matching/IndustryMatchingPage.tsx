import Link from "next/link";
import { AIExperiencePage } from "../AIExperiencePage";

export function IndustryMatchingPage() {
  return (
    <div>
      <aside className="ai-organization-preview" aria-label="Akses Organization">
        <div>
          <strong>Preview Organization</strong>
          <p>Prototype dapat dicoba, tetapi penggunaan penuh memerlukan workspace Organization.</p>
        </div>
        <Link className="button secondary" href="/plans/organization">Pelajari akses Organization</Link>
      </aside>
      <AIExperiencePage featureId="industry-matching" />
    </div>
  );
}
