# Final Walkthrough

**Checkpoint:** Final Validation — CLOSED
**Release label:** PASS — Chromium Prototype Scope

## 1. Guest journey

Start at `/`. The white brand navbar presents Explore, Projects, People,
Organizations, and Opportunities with ProjectLink's blue, teal, and navy
identity. The landing page moves from product value to goal cards, featured
projects, contribution evidence, explainable matching, and the final CTA.

Open `/search?scope=projects`. The navbar becomes contextual while query,
filters, sorting, selected result, and detail remain URL-addressable. Selecting
a result opens evidence and gaps without losing list context. After contextual
login, the user returns to the encoded search URL. The saved search or item is
persisted in `sessionStorage`; `saved=1` only triggers one-time success feedback
and is not the source of truth for saved state.

State ownership in this journey is:

- URL: scope, query, filters, sort, selected result, and temporary feedback.
- `sessionStorage`: saved item and saved search.

## 2. New-user journey

Open `/home?prototypeState=new`. The home prioritizes one next step, not a busy
dashboard. Change the active goal, open the workspace, edit the project context,
save a goal-specific draft, inspect the publication preview, and publish the
first value. Draft and goal state remain in the current session.

## 3. Returning-user journey

Open `/home?prototypeState=returning`. Priority actions appear before active
projects, collaboration, matches, opportunities, and activity. Activate
“Tinjau”; keyboard focus moves to the expanded action. Escape closes it and
restores focus. Completing an action updates activity and remains completed
after refresh.

## 4. Organization journey

Open `/organization/nexa-research-lab`. The organization shell changes the
identity, navigation, action strip, pipeline summary, shortlist context,
projects, problem-based search, and organization metrics.

Continue to organization search, compare editable criteria, reasons, evidence,
and gaps, then add a result to the shared shortlist. Assign a reviewer and move
the item through Pipeline. Members and Billing retain least-privilege and
recovery messaging without expanding the prototype into a CRM.

The canonical organization walkthrough routes are:

```text
/organization/nexa-research-lab
/organization/nexa-research-lab/projects
/organization/nexa-research-lab/search?scope=talent
/organization/nexa-research-lab/search?scope=projects
/organization/nexa-research-lab/shortlists
/organization/nexa-research-lab/pipeline
/organization/nexa-research-lab/members
/organization/nexa-research-lab/billing
```

`/shortlists` and `/billing` are canonical. `/org/...` is a deprecated
compatibility route and does not replace the `/organization/...` routes.

At 390 px, organization search becomes a staged Filter → Results → Detail
experience. Only one working panel is shown at a time, while the URL retains
the selected result.

## 5. Recovery and compatibility

- Loading uses non-focusable skeletons.
- Empty search keeps the query and offers broader search/save paths.
- Error search keeps criteria and provides a working retry.
- The deprecated `/org/nexa-research-lab/projects` route hands off to the
  canonical `/organization/nexa-research-lab/projects`.
- Unknown legacy slugs are not generated and use the static 404.

## 6. Responsive comparison

| Width | Layout behavior |
| --- | --- |
| 1440 / 1366 | Full navbar, multi-column grids, three-panel organization search |
| 1024 | Compressed grids and safe shell spacing before mobile staging |
| 768 | Tablet stacking and reduced card density |
| 390 portrait | Single-column content and staged organization search |
| 844 landscape | Mobile navigation with short viewport resilience |
| Effective 320 | Reflow without page-level horizontal overflow |

Tables become grouped cards on mobile. The pipeline is the only intentionally
two-dimensional labeled region. Primary targets keep a minimum 44 px
interactive area.

## 7. Validation evidence

- Typecheck command: `pnpm --filter @projectlink/web run typecheck` — PASS.
- Build command: `pnpm --filter @projectlink/web run build` — PASS.
- Static output: `apps/web/out/` — 64 generated pages.
- `git diff --check`: PASS.
- Chrome standalone: PASS, 112 route/viewport checks plus state and recovery.
- Edge standalone: PASS.
- In-app Chromium: PASS as supporting visual/semantic evidence.
- Keyboard core journeys: PASS.
- Focus entry and restoration: PASS.
- Heading and landmark structure: PASS.
- Form labels and accessible names on audited journeys: PASS.
- Touch target audit: PASS.
- Page-level overflow audit: PASS.
- Critical accessibility blockers: 0.
- Reduced-motion specific validation: NOT TESTED.
- Primary CTA audit on audited core and supporting routes: PASS.
- Full exhaustive link crawling across all 64 pages: NOT PERFORMED.
- Generated static route files: VERIFIED.
- Production static-host clean-URL refresh behavior: NOT TESTED.
- Firefox: not installed.
- Safari/iOS WebKit: deferred.

Browser walkthroughs used the local application server, not a
production-equivalent server serving `out/`. Deployment readiness was not
assessed.

Milestone 11 stops here. No deployment or Milestone 12 work is included.
