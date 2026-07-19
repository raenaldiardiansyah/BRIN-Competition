# Known Limitations

## Cross-browser validation

Full validation was completed on Chromium-based browsers.
Firefox received best-effort consideration but was not installed in the
current environment, so its smoke test was not run.
Safari and iOS WebKit were not validated in the current Windows-based
prototype environment and require a separate compatibility pass before
production release.

## Assistive technology

Keyboard navigation, semantic snapshots, focus behavior, landmarks, names,
duplicate IDs, live-region structure, and reflow were audited. A full usability
pass with NVDA/JAWS, VoiceOver, and mobile screen readers is still required
before a production accessibility claim.

## Static hosting

The export uses flat `.html` files because `trailingSlash` is not configured.
The hosting layer must map clean nested URLs to those generated files and map
unknown paths to `404.html`. Runtime redirects and rewrites are intentionally
not used. Generated route files were verified, but clean-URL refresh on the
final production static-host configuration was not tested. Browser walkthroughs
used the local application server rather than a production-equivalent server
serving `out/`.

## Reduced motion

Reduced-motion CSS handling exists in the prototype styles, but a dedicated
`prefers-reduced-motion` behavioral validation was not performed. It must not
be reported as PASS until tested with the preference enabled.

## Link coverage

Primary CTA checks passed on the audited core and supporting routes. A full
exhaustive crawl of every link across all 64 exported pages was not performed.

## Prototype persistence

Product mutations use `sessionStorage`. They persist through refresh,
back/forward, and same-tab route changes, but intentionally reset when the
prototype session is cleared or a new browser session is opened. This is not a
backend persistence guarantee.

## Prototype controls

The Preview control is a demonstration aid. Its width simulation is not a
replacement for actual browser viewport testing; the final gate used
standalone Chromium device metrics.

## Scope boundary

This milestone did not add production authentication, backend data,
permissions enforcement, payments, real collaboration messaging, deployment,
or new product personas. The result remains a high-fidelity static prototype.
The prototype has not been deployed or tested in a production hosting
environment, so deployment readiness is not assessed.

## Accepted limitation record

### LIM-001 — WebKit and dedicated screen-reader validation

| Field | Value |
| --- | --- |
| Severity | Medium for production; non-blocking for prototype |
| Route/screen | All |
| Viewport | Representative desktop/mobile devices |
| Steps to reproduce | Run the final walkthrough in Safari/iOS WebKit and representative screen readers. |
| Expected | Equivalent access and behavior across target production environments. |
| Actual | Those environments were unavailable in the Windows prototype workspace. |
| Resolution | Schedule a production-readiness compatibility and AT pass. |
| Retest result | Not tested |
| Evidence | Browser matrix and environment availability audit |
| Status | ACCEPTED_LIMITATION |
