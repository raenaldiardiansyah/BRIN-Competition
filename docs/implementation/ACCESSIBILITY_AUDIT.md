# Accessibility Audit

**Milestone:** 10
**Audit date:** 2026-07-19
**Status:** VERIFIED — prototype scope

## Audit coverage

- Semantic landmarks and one primary heading per audited screen.
- Keyboard access and visible focus.
- Focus movement and focus return for expanded action content.
- Accessible names for form controls, staged navigation, tables, and pipeline.
- Global mutation feedback.
- Duplicate ID check across 112 route/viewport combinations.
- Reflow at effective 320 CSS px.
- Manual review of brand-token contrast and state communication.

## Implemented hardening

- A skip link targets `#main-content`.
- One global polite status announcer handles successful mutations.
- One assertive alert channel is reserved for errors.
- Local card-level live regions were removed to prevent repeated announcements.
- Expanded returning-user actions receive focus and close with `Escape`.
- Focus returns to the action trigger after close.
- Reviewer and pipeline-note controls have explicit labels and unique IDs.
- Shortlists, member data, and pipeline are named, focusable regions.
- Mobile organization stages expose `aria-controls` and pressed state.
- A consistent `:focus-visible` treatment is applied to interactive elements.

## Findings

### A11Y-001 — Mutation feedback was fragmented

| Field | Value |
| --- | --- |
| Severity | High |
| Route/screen | New-user home, returning home, search, organization workspace |
| Viewport | All |
| Steps to reproduce | Save, publish, shortlist, assign reviewer, change pipeline, or add a note. |
| Expected | A concise non-critical update is announced once. |
| Actual | Feedback depended on local visual state and some sections had their own live regions. |
| Resolution | Added one global polite announcer and routed product mutations through it. |
| Retest result | One `status` and one reserved `alert` landmark are present; local duplicate live regions are removed. |
| Evidence | `accessibility.tsx`; in-app semantic snapshots |
| Status | VERIFIED |

### A11Y-002 — Expanded action focus context

| Field | Value |
| --- | --- |
| Severity | High |
| Route/screen | `/home?prototypeState=returning` |
| Viewport | Desktop and mobile |
| Steps to reproduce | Activate the first “Tinjau” button, then press `Escape`. |
| Expected | Focus moves to the expanded region, then returns to the trigger. |
| Actual | The panel opened visually without deterministic keyboard focus handling. |
| Resolution | Added `aria-expanded`, `aria-controls`, labeled region focus, Escape close, and focus return. |
| Retest result | In-app Chromium marked the region active; after Escape the original trigger was active. |
| Evidence | `product-homepages.tsx`; in-app browser semantic snapshots |
| Status | VERIFIED |

### A11Y-003 — Unnamed data and workflow regions

| Field | Value |
| --- | --- |
| Severity | Medium |
| Route/screen | Shortlists, pipeline, members, organization search |
| Viewport | All |
| Steps to reproduce | Navigate by landmark/region or inspect accessible names. |
| Expected | Complex regions and controls have stable accessible names. |
| Actual | Reviewer select, note input, and complex data regions lacked explicit context. |
| Resolution | Added labels, IDs, region names, and mobile control relationships. |
| Retest result | Semantic snapshots expose named regions and labeled controls. |
| Evidence | `product-experiences.tsx` |
| Status | VERIFIED |

### A11Y-004 — Keyboard entry and visible focus

| Field | Value |
| --- | --- |
| Severity | High |
| Route/screen | Shared shell |
| Viewport | All |
| Steps to reproduce | Load `/` and press Tab once. |
| Expected | A visible skip link is first and focus styling is perceivable. |
| Actual | There was no direct bypass to main content. |
| Resolution | Added the skip link and global focus-visible ring. |
| Retest result | Standalone Chrome reports first Tab target “Lewati ke konten utama”. |
| Evidence | Chrome CDP validation report |
| Status | VERIFIED |

### A11Y-005 — Dedicated assistive-technology pass

| Field | Value |
| --- | --- |
| Severity | Low |
| Route/screen | All |
| Viewport | N/A |
| Steps to reproduce | Run complete journeys with NVDA, JAWS, VoiceOver, or TalkBack. |
| Expected | Production readiness includes representative assistive-technology testing. |
| Actual | This Windows prototype pass used semantic inspection and keyboard testing, not a full screen-reader usability session. |
| Resolution | Schedule a dedicated AT pass before production release. |
| Retest result | Not performed in this milestone. |
| Evidence | `KNOWN_LIMITATIONS.md` |
| Status | ACCEPTED_LIMITATION |

## Contrast

The shell retains white/light surfaces, navy body text, blue interaction
states, and teal as a supporting accent. Focus is not communicated by color
alone. No critical contrast blocker was found in the core walkthrough; a
production pass should still use an automated contrast scanner plus device
rendering.
