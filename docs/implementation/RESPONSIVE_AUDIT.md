# Responsive Audit

**Milestone:** 10 — Responsive & Accessibility Hardening
**Audit date:** 2026-07-19
**Status:** VERIFIED

## Scope and acceptance criteria

The audit covered 16 core routes at:

| Name | Viewport |
| --- | --- |
| Desktop | 1440 × 1000 |
| Laptop | 1366 × 850 |
| Small desktop | 1024 × 768 |
| Tablet portrait | 768 × 900 |
| Mobile portrait | 390 × 844 |
| Mobile landscape | 844 × 390 |
| Effective 400% reflow | 320 × 800 CSS px |

There must be no page-level horizontal overflow. A controlled horizontal
region is allowed only for inherently two-dimensional content. Primary
interactive targets must be at least 44 × 44 CSS px.

## Result

The standalone Chromium runner completed **112 route/viewport checks** with
zero failures. Every audited page had one visible `h1`, a visible `main`,
no duplicate IDs, no dead primary link, and no page-level overflow.

Organization search switches to staged Filter → Results → Detail navigation
on mobile. Data tables become grouped cards below 780 px. At 320 CSS px,
headings, actions, content cards, the sticky shell, and prototype controls
remain usable.

## Findings

### RSP-001 — Page-level horizontal overflow

| Field | Value |
| --- | --- |
| Severity | High |
| Route/screen | All audited core routes |
| Viewport | 320–1440 CSS px |
| Steps to reproduce | Open each audited route and compare `documentElement.scrollWidth` with `innerWidth`. |
| Expected | The page does not widen beyond the viewport. |
| Actual | Grid children and shell content could previously retain an intrinsic minimum width. |
| Resolution | Added shell overflow containment and `min-width: 0` to grid/shell children. |
| Retest result | 112/112 checks passed. |
| Evidence | `product-shell.css`, `product-experiences.css`, `scripts/validate-chromium.mjs` |
| Status | VERIFIED |

### RSP-002 — Mobile tables

| Field | Value |
| --- | --- |
| Severity | Medium |
| Route/screen | Shortlists and organization members |
| Viewport | ≤780 px |
| Steps to reproduce | Open the table routes at 390 px and 320 px. |
| Expected | Core information and actions remain readable without page scroll. |
| Actual | The former table layout required a 720 px minimum width. |
| Resolution | Converted rows to labeled grouped cards on narrow viewports. |
| Retest result | No page overflow; row content and reviewer control remain available. |
| Evidence | `product-experiences.css` mobile table rules |
| Status | VERIFIED |

### RSP-003 — Mobile staged organization search

| Field | Value |
| --- | --- |
| Severity | High |
| Route/screen | `/organization/nexa-research-lab/search?scope=talent` |
| Viewport | 390 × 844 |
| Steps to reproduce | Select a result, then activate Filter, Results, and Detail. |
| Expected | Only the selected stage is visible and every stage remains reachable. |
| Actual | Three-panel desktop content was too dense for mobile. |
| Resolution | Added an accessible staged tab control and single-panel mobile presentation. |
| Retest result | Filter, Results, and Detail switch correctly in standalone and in-app Chromium. |
| Evidence | `px-org-mobile-tabs`; standalone CDP result; in-app semantic snapshot |
| Status | VERIFIED |

### RSP-004 — Touch target and reflow resilience

| Field | Value |
| --- | --- |
| Severity | Medium |
| Route/screen | Shared shell and product actions |
| Viewport | 390 px and effective 320 CSS px |
| Steps to reproduce | Inspect primary links, buttons, filter removal, navigation, and form controls. |
| Expected | Primary targets are at least 44 × 44 CSS px and do not overlap. |
| Actual | Several compact controls inherited smaller line-box dimensions. |
| Resolution | Applied a 44 px minimum interactive area and 44 px form-control height. |
| Retest result | Actions remain visible and operable at all target widths. |
| Evidence | `product-shell.css` interactive target rules |
| Status | VERIFIED |

## Controlled horizontal regions

The collaboration pipeline remains a labeled, focusable two-dimensional
region where horizontal scrolling can be appropriate. It does not widen the
page. Primary mobile tables no longer rely on horizontal scrolling.
