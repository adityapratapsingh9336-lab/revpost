# 06 --- UI/UX Specification

## 1. Visual direction

Create a modern, premium, focused SaaS product. Avoid a generic
template-heavy admin panel.

Suggested direction: - Light-first interface with optional dark theme. -
Neutral warm/white surfaces, dark charcoal text and one restrained brand
accent. - Strong typography hierarchy. - Spacious cards and clear data
density. - Rounded but not excessively pill-shaped controls. - Subtle
borders and shadows. - Consistent spacing and responsive layouts. - Use
real empty states, skeletons and error states. - Do not invent brand
colours before final product identity is chosen; use a temporary neutral
accent token.

## 2. Application shell

Desktop: - Left sidebar with workspace switcher and navigation. - Main
content area with page title and contextual actions. - Optional
right-side inspector in editor pages. - Top bar with notifications, help
and user menu.

Navigation: 1. Overview 2. Brands 3. Reference Studio 4. Visual DNA 5.
AI Studio 6. Creative Library 7. Content Calendar 8. Publishing 9.
Social Accounts 10. Analytics 11. AI Control Center 12. Settings

Hide or mark unavailable modules that are not implemented. Do not create
dead links.

## 3. Onboarding

A guided checklist: - Create workspace. - Create brand. - Add brand
knowledge. - Upload reference images. - Review Visual DNA. - Generate
first creative.

Allow users to skip optional steps and resume later.

## 4. Dashboard

Show: - Brand/workspace selector. - Content status summary. - Upcoming
scheduled posts. - Recently generated creatives. - Connected social
account status. - AI usage snapshot. - Setup checklist when workspace is
new.

Avoid fake analytics. Empty states should explain how to populate data.

## 5. Brand Studio

Tabs: - Overview. - Products/services. - Audience. - Voice and
language. - Visual identity. - Restrictions and claims. - Approved
assets.

Forms need save/cancel, validation, dirty-state warnings and clear
success/error feedback.

## 6. Reference Studio

-   Upload dropzone and file picker.
-   Grid of reference cards with thumbnail, source, date and status.
-   Filters by brand, status and source.
-   Reference detail drawer showing OCR, palette and analysis.
-   Re-analyse and delete actions.
-   Display rights/source notes.

## 7. Visual DNA

Present editable sections: - Palette swatches with hex values. -
Typography hierarchy. - Layout patterns. - Composition and spacing. -
Image style. - Brand elements and CTA placement. - Confidence/evidence
where available. - Version history and approve/update action.

Do not imply exact font identification when model only inferred a font
category.

## 8. AI Studio

Input panel: - Brand selector. - Platform and format. - Static
post/carousel selector. - Topic/brief. - Objective. - Language and
tone. - CTA. - Slide count for carousel. - Optional reference/archetype
selection.

Output panel: - Caption and hashtags. - Preview. - Design archetype. -
Regenerate controls. - Save draft / open editor / export.

Show generation progress and provider failure messages without exposing
secrets.

## 9. Creative Editor

Layout: - Left panel: pages/slides and element layers. - Center: canvas
with zoom and fit. - Right panel: selected element properties. - Top
toolbar: undo, redo, preview, save, export.

Support: - Select/move/resize. - Text edit and typography. - Image
replace/crop/fit. - Shape and background controls. - Layer ordering. -
Duplicate/delete. - Slide reorder. - Undo/redo. - Bounds and overflow
warnings.

Use a single source of truth for blueprint state. Persist revisions and
avoid accidental overwrites.

## 10. Content Calendar

-   Month/week/list views.
-   Timezone display.
-   Filter by brand, platform, account and status.
-   Draft/scheduled/published states.
-   Drag-and-drop only if keyboard-accessible alternative exists.
-   Schedule dialog with timezone and account validation.

## 11. Social Accounts and Publishing

-   Connect account button.
-   Explain official OAuth flow and required account type/permissions.
-   Show connected account, platform, scopes, token health and reconnect
    state.
-   Queue with status and failure reason.
-   Pause publishing toggle.
-   Never expose tokens.
-   Require confirmation before immediate publishing.

## 12. AI Control Center

Provider cards: - Provider name and connection state. - Add key / test /
remove. - Available model list with capability labels. -
Primary/fallback priority per task. - Usage and estimated cost. -
Cooldown/health state. - Key status only; never display full secret.

## 13. Analytics

-   Date range.
-   Platform/account filter.
-   KPI cards only for metrics actually available.
-   Trend charts.
-   Top posts.
-   Metric source and last sync time.
-   Empty and permission-limited states.

## 14. Responsive behavior

-   Desktop is primary for creative editing.
-   Tablet supports content management.
-   Mobile supports dashboard, calendar, review and basic editing.
-   Avoid horizontal overflow.
-   Keep essential actions reachable.

## 15. Accessibility

-   Semantic landmarks and headings.
-   Keyboard access to navigation and editor controls.
-   Visible focus.
-   Label all form controls.
-   Accessible validation messages.
-   Contrast compliant with WCAG AA targets.
-   Do not communicate status using colour alone.
