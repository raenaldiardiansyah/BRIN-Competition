import { AIExperiencePage } from "../AIExperiencePage";
import { AIOrganizationPreview } from "../shared/AIOrganizationPreview";

export function IndustryMatchingPage() {
  return (
    <AIOrganizationPreview>
      <AIExperiencePage featureId="industry-matching" />
    </AIOrganizationPreview>
  );
}
