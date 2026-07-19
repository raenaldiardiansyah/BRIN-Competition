# Final Validation Report

**Milestones:** 10–11
**Validation date:** 2026-07-19
**Workspace:** `D:\Downloads\TELKOM\BRIN`
**Release status:** **PASS — Chromium Prototype Scope**

```text
Implementation: COMPLETE
Core validation: PASS
Documentation: COMPLETE
Final Validation Checkpoint: CLOSED
Deployment readiness: NOT ASSESSED
Cross-browser production readiness: NOT CLAIMED
```

## Commands and build

| Check | Actual command | Result |
| --- | --- | --- |
| Typecheck | `pnpm --filter @projectlink/web run typecheck` | PASS |
| Static export | `pnpm --filter @projectlink/web run build` | PASS |
| Chrome gate | `node --experimental-websocket scripts/validate-chromium.mjs` | PASS |
| Edge gate | Same runner with Edge executable argument | PASS |
| Diff whitespace check | `git diff --check` | PASS |

Next.js `16.2.10` generated **64 static pages**. The project uses App Router,
`output: "export"`, unoptimized images, default `out/`, and no configured
`trailingSlash`, redirect, rewrite, or custom `distDir`.

## Browser Validation Matrix

| Browser/engine | Scope | Status | Gate |
| --- | --- | --- | --- |
| Chrome 150.0.7871.125 | Full walkthrough, 112 responsive checks, state/recovery/console | PASS | Required |
| Edge 150.0.4078.65 | Standalone Chromium secondary gate | PASS | Required browser evidence |
| Chromium mobile emulation | Full responsive walkthrough and staged navigation | PASS | Required |
| In-app Chromium preview | Supporting visual, semantic, focus, and mobile-stage check | PASS | Supporting |
| Firefox | Not installed; core-route smoke test not run | Not tested | Best-effort |
| Safari/WebKit | Not available in current Windows environment | Deferred | Not required |

The in-app browser was not used as the only evidence.

## Standalone Chromium evidence

- 16 routes × 7 viewports = **112 checks**, zero failures.
- No page-level overflow.
- Exactly one main `h1` and no duplicate ID on every audited screen.
- Search filter and selected result remain encoded in the URL.
- Refresh and browser back/forward restore the selected context.
- Returning-user completed action persists through refresh.
- Organization shortlist state persists across routes.
- Allowed login `returnTo` restores query/filter context and completes
  `save-search`.
- Loading, empty, error, and retry recovery states pass.
- Mobile organization Detail and Filter stages switch correctly.
- Legacy `/org/nexa-research-lab/projects` hands off to canonical
  `/organization/nexa-research-lab/projects`.
- First Tab target is the skip link.
- No runtime exception or console error was captured.
- Primary CTA audit on the audited core and supporting routes passed.

A full exhaustive crawl of every link across all 64 exported pages was not
performed. The CTA result must not be interpreted as an all-link crawl.

## Static export evidence

The build produced the expected flat `.html` form because `trailingSlash` is
not configured:

```text
out/index.html
out/explore.html
out/projects/aqua-loop.html
out/profiles/maya-pradipta.html
out/organizations/nexa-research-lab.html
out/organization/nexa-research-lab.html
out/org/nexa-research-lab.html
out/404.html
```

`out/org/slug-tidak-dikenal.html` is not generated. Unknown legacy slugs
therefore resolve through the static host's 404 behavior rather than an
open-ended organization fallback.

Static route files were verified in the generated output. Direct nested-route
navigation and refresh were exercised through the local application server.
Clean-URL refresh behavior on the final production static-hosting
configuration was not tested because a production-equivalent server serving
`out/` was outside this milestone. Deployment readiness is not assessed.

## Core journey outcome

| Journey | Result |
| --- | --- |
| Guest landing → contextual search → detail/auth return | PASS |
| New user → goal-specific draft → preview/first value | PASS |
| Returning user → review/complete action → persisted state | PASS |
| Organization → search → shortlist → pipeline/member/billing support | PASS |

## Final finding

### VAL-001 — Chromium prototype release gate

| Field | Value |
| --- | --- |
| Severity | Release gate |
| Route/screen | Four core journeys and supporting core routes |
| Viewport | 1440, 1366, 1024, 768, 390, 844 landscape, effective 320 CSS px |
| Steps to reproduce | Run typecheck, build, and the standalone validator against localhost. |
| Expected | All required gates pass without blocking console/accessibility/responsive failures. |
| Actual | All required Chromium gates pass. |
| Resolution | Milestone 10 hardening plus Milestone 11 validation. |
| Retest result | PASS |
| Evidence | Build log, CDP JSON, in-app semantic snapshots, static `out/` files |
| Status | VERIFIED |

## Scope label

This result is deliberately **not** labeled cross-browser production ready.
Firefox was unavailable and Safari/iOS WebKit is deferred. Reduced-motion
behavior, exhaustive all-link crawling, and production static-host routing
remain outside the validated scope.
