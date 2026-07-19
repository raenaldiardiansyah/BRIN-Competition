# Keyboard Interaction Map

**Milestone:** 10
**Status:** VERIFIED for Chromium prototype scope

## Global behavior

| Interaction | Expected behavior | Result |
| --- | --- | --- |
| First Tab | Reveals “Lewati ke konten utama” | PASS |
| Enter on skip link | Moves focus to `main` | PASS |
| Tab / Shift+Tab | Follows DOM order without a trap | PASS |
| Enter / Space | Activates native links and buttons | PASS |
| Focus-visible | Teal high-contrast ring with offset | PASS |
| Browser Back/Forward | Restores URL search and selected state | PASS |

## Journey 1 — Guest discovery and contextual authentication

1. Tab through the guest navbar or goal cards.
2. Open Projects search.
3. Move through query, filters, results, and selected detail.
4. Activate Save after login.
5. Complete the simulated login.
6. Focus returns to a search page whose query/filter context is preserved and
   whose URL includes `saved=1`.

**Result:** PASS.

## Journey 2 — New user first value

1. Open `/home?prototypeState=new`.
2. Change the active goal through the native select.
3. Activate “Buat workspace”.
4. Complete labeled project fields.
5. Save draft and open preview.
6. Publish the first value.

Draft and goal data remain in session storage. Mutation feedback is announced
through the single polite status region.

**Result:** PASS.

## Journey 3 — Returning user action

1. Open `/home?prototypeState=returning`.
2. Activate a “Tinjau” trigger.
3. Focus moves to the labeled action region.
4. Use `Escape` to close; focus returns to the original trigger.
5. Reopen and complete the action.
6. Refresh the page; the completed action remains removed.

**Result:** PASS.

## Journey 4 — Organization shortlist and pipeline

1. Open organization search and select a result.
2. On mobile, use Filter, Results, and Detail staged controls.
3. Add the item to the shared shortlist.
4. Open Shortlists, assign a reviewer, and continue to Pipeline.
5. Change a stage or decision and add a labeled note.

Named regions allow the pipeline and data collections to receive focus without
creating a page-level keyboard trap.

**Result:** PASS.

## Dialog, drawer, and recovery conventions

The current core prototype uses expanded inline regions and staged mobile
panels rather than modal dialogs for primary journeys. Expanded action content
supports Escape and focus return. Error recovery links are native links and
loading skeletons never receive focus.

## Finding record

### KEY-001 — Action panel focus return

| Field | Value |
| --- | --- |
| Severity | High |
| Route/screen | Returning-user home |
| Viewport | All |
| Steps to reproduce | Tab to “Tinjau”, press Enter, then Escape. |
| Expected | Detail receives focus; Escape returns focus to the trigger. |
| Actual | Before hardening, focus stayed on the removed interaction context. |
| Resolution | Added explicit panel focus and trigger restoration. |
| Retest result | PASS in in-app Chromium. |
| Evidence | Active region/trigger semantic snapshots |
| Status | VERIFIED |
