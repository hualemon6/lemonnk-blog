# Horizontal journey redesign

Approved in conversation on 2026-09-16. The user chose a desktop-first horizontal timeline, with fixed panels above, to the left and below the central canvas. Mobile redesign is outside this iteration.

## Composition

- Cool off-white canvas, translucent white panels, fine borders, soft shadows and restrained blue/green accents.
- Top navigation panel, left profile/filter panel, central horizontally scrollable timeline, bottom selection detail and navigation panel.
- Timeline cards alternate above and below a continuous route. Dates increase left to right. The latest dated entry is selected initially.
- Click a card to update the bottom detail panel. Support horizontal trackpad scrolling, pointer dragging, previous/next controls, keyboard selection and period navigation. Respect reduced motion.
- Keep panels in the viewport on ordinary desktop sizes. Short desktop windows may scroll vertically rather than clip controls.

## Content integrity

- Use existing public posts and project data. Post-linked entries derive their dates and destinations from the actual content collection; draft posts are excluded.
- Existing projects have no dates. Render them in a clearly labelled undated group, separate from chronological events. Do not infer dates or claim current research status from an old post.
- Curated journey metadata lives separately from page markup and can be extended with real dated experiences and images.
- Reuse the existing avatar and article artwork. Decorative diagrams are illustrations, not charts implying new measurements.

## Integration

- Keep Astro, current URLs and the GitHub Pages base-path helper.
- Extend shared tokens and navigation so article, archive, project and about pages share the new surfaces. Preserve narrow article typography, formulas, code blocks, edition switching and UI language/theme preferences.
- No new runtime dependencies or changes to the local publishing workflow. No commit, push or deployment was requested.

## Implementation checklist

- [x] Add journey data adapter and reusable artwork/card components.
- [x] Implement the dashboard layout, timeline and selection controls.
- [x] Apply shared panel styling to navigation and reading pages.
- [x] Build and inspect desktop layouts, light/dark themes, filters, navigation, dragging and existing articles; review the zero-entry path.
- [x] Review correctness, accessibility, base paths and dependency impact.

## Verification

- Production build: all 14 routes generated successfully. No added dependencies.
- Desktop checks: 1280 x 720, 1366 x 768, 1440 x 900. Timeline cards, sidebar footer and bottom controls fit after the compact-height adjustments.
- Browser checks: all five categories (9 / 3 / 1 / 4 / 1 entries), one-entry boundaries, period selection, left/right keyboard movement, pointer drag without accidental selection, latest reset, light/dark modes and English UI.
- Article regressions: all five public articles remain in the archive; RNN artwork and 16 formulas render; code tools and ME/AI edition switching work. Project gallery/list toggle works.
- Static output audit: 170 local links and asset references exist and use the deployment base.
- Production-preview smoke test: selection updates the detail panel; no browser errors.
- Independent review found a missing cross-year group boundary and two ARIA labelling inconsistencies. These were corrected in both server rendering and client filtering, with shared translated labels for the homepage and detail region.

## Adding content

`src/data/journey.json` accepts post-linked records using `postId`, or independent dated records using `id` and `date`. Both carry `category` (`learning`, `research`, `project`, `life`), `title`, `summary`, `detail` and `visual` (`journal`, `code`, `signal`, `network`, `grid`); `image` is optional. Independent records may include an internal path or HTTP(S) `url`. Records without a destination display their full description without a link. Validation rejects invalid dates and categories. Project descriptions continue to come from `src/data/projects.json`.
