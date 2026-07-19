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
not used.

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
