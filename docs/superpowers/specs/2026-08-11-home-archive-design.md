# Home and Archive Visual Redesign

## Intent

The site should be minimal in the sense of containing very few competing
elements, not visually restrained. Each principal page gets one dramatic
subject: the person on the home page, time on the archive page, and the text
on article pages.

No descriptions, cards, dashboards, decorative badges, or generic timeline
widgets are introduced. The existing bright/dark themes remain first-class.

## Home Page: Person and Recent Writing

- Add the supplied smiling avatar as a separate home-page asset. It is a
  deliberate expression variant, while the existing avatar remains on About.
- Replace the current small name-and-three-icons introduction with a large,
  asymmetric identity composition: avatar plus `LemonNK`, with only the
  existing GitHub, LeetCode, and About links retained as compact controls.
- The identity composition should occupy the top of the page, then resolve
  directly into the latest-article list. It must not add explanatory copy or
  a “latest posts” heading.
- On desktop, the avatar and wordmark form a single horizontal composition;
  on mobile, they stack without horizontal overflow and the article list
  begins close enough to keep the page useful.

## Archive Page: Editorial Chronology

- Group public posts by publication year, newest year first.
- Render each year as a large system-serif numeral (`2026`), with editorial
  rather than UI-like typography.
- Each post uses a compact left date block (`AUG` / `10`) attached to a thin,
  continuous vertical rule. The title is the reading target; metadata stays
  subordinate beneath it.
- There are no card backgrounds, coloured status dots, summaries, or
  secondary panels. The line, large year, dates, and titles provide the full
  visual rhythm.
- The same construction contracts to a narrow date rail on mobile, so dates
  remain readable while titles retain most of the width.

## Motion

- CSS-only motion works on GitHub Pages and keeps the static site fast.
- The home identity appears once on load: avatar settles upward by a few
  pixels, then the wordmark fades in fractionally later. There is no looping
  movement.
- Archive years and entries receive short staggered reveal transitions. The
  movement is small and serves the chronology rather than becoming a scroll
  effect.
- All animation is disabled under `prefers-reduced-motion: reduce`.

## Assets and Implementation Boundaries

- Copy the user-supplied smiling avatar into `public/images/profile/` and
  reference it through `path()` so GitHub Pages retains the repository base
  prefix.
- Use local system fonts only. `Georgia` / `Times New Roman` may provide the
  archival English numeral contrast; no online font request is introduced.
- Keep the About page, article layout, content model, Studio behaviour, and
  unpublished article drafts outside this redesign.

## Verification

1. Build with `npm run build`.
2. Visually inspect home and archive at desktop and 320px widths in both
   themes; check that no horizontal overflow occurs.
3. Verify the avatar URL includes `/lemonnk-blog/` in the production build.
4. Verify reduced-motion mode suppresses the new motion.
5. Verify the archive contains each published post exactly once and in
   descending date order.
