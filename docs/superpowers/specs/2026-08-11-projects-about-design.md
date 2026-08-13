# Projects and About Visual Redesign

## Shared Role

The site uses one visual protagonist per primary page: person (home), time
(archive), work (projects), identity (About). Projects and About continue the
same sparse, high-contrast, editorial system without duplicating the archive
timeline.

## Projects: Work Index

- Replace the conventional page heading with a large `PROJECTS` wordmark set
  in a local system serif. It is the page’s single dramatic element.
- List projects as numbered records (`01`, `02`, …), not cards. On desktop a
  narrow index column sits beside the large project name; the description,
  technology, and metric remain a subordinate annotation below it.
- The title remains the direct GitHub link. No additional CTA, badge, or
  coloured panel is added.
- Each record is separated only by a fine rule. Hovering a project causes a
  short, small title translation and colour response.
- Entries use small staggered CSS-only reveals. Mobile keeps the sequence
  number visible but lets supporting content fall underneath the title.

## About: Identity Hero

- Make the About profile composition match the home page scale: a large
  avatar paired with a large `LemonNK` wordmark, without an “About” label.
- Use the current About avatar as the identity expression; the smiling avatar
  remains unique to the home page.
- Turn `INFJ`, `NJU IS`, and `爱专 · 新地球` into individual external links
  with restrained underlines and external-link affordances on hover.
- Link targets:
  - INFJ: the English Myers–Briggs Type Indicator Wikipedia article.
  - NJU IS: `https://is.nju.edu.cn/`, the Nanjing University Intelligence
    Science and Technology school site.
  - 新地球: the Chinese Wikipedia album article for JJ Lin’s *新地球*.
- Preserve the existing editable About Markdown extension: light mode starts
  beneath a fine rule; dark mode presents it within a fine border.

## Motion and Accessibility

- Both pages use the existing CSS-only, one-time reveal vocabulary. Nothing
  loops and no JavaScript hydration is needed.
- Under `prefers-reduced-motion: reduce`, the global motion rule makes the
  new transitions effectively instantaneous.

## Boundaries and Verification

- Do not change article content, Studio, the content schema, or project data.
- Retain the GitHub Pages base-path helper for internal asset URLs; external
  profile links are plain HTTPS links with `target="_blank"` and
  `rel="noopener noreferrer"`.
- Build, then inspect Projects and About at desktop and 320px widths in both
  themes. Check every profile link target and confirm no horizontal overflow.
