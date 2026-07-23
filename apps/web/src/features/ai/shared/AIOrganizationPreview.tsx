import Link from "next/link";
import type { ReactNode } from "react";

export function AIOrganizationPreview({ children }: { children: ReactNode }) {
  return (
    <div>
      <aside className="ai-organization-preview" aria-label="Preview fitur Organization">
        <div>
          <strong>Preview Organization · paket aktif Pro Individual</strong>
          <p>
            Simulasi dapat dicoba tanpa mengubah entitlement. Workspace penuh,
            konteks tim, dan penggunaan bersama memerlukan paket Organization.
          </p>
        </div>
        <Link className="button secondary" href="/subscription?mode=compare&plan=organization">
          Pelajari akses Organization
        </Link>
      </aside>
      {children}
    </div>
  );
}
