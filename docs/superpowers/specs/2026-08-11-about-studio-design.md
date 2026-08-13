# About Page and Studio Editor Design

## Scope

Replace the current About page with a responsive personal profile and add a
separate About editing mode to LemonNK Studio. Article editing remains intact.
No commit, push, or deployment is included.

## Public Page

- Remove the visible `关于` label and `personal notes` text.
- Generate an original round-face avatar from the supplied image as a reference
  for its simple expression; do not reproduce its source branding or artwork.
- Use the same profile hierarchy in both themes: avatar, LemonNK, INFJ, NJU IS,
  and `爱专 · 新地球`.
- The editable Markdown content is the extension area. In light mode it begins
  beneath a fine horizontal rule; in dark mode it sits in a fine bordered box.
- Desktop uses an avatar-and-profile row. Mobile uses a compact stacked layout
  with no horizontal overflow.

## Data and Studio

- Store the profile in `src/data/about.json`, with fixed fields for `type`,
  `major`, `album`, `avatar`, and an extensible `content` Markdown string.
- Astro imports this data at build time and renders the Markdown content in the
  extension area.
- Add a Studio mode switch: `文章` retains existing behavior, while `About`
  shows the four profile fields and the extension Markdown textarea.
- Add restricted `GET` and `POST` About endpoints. The server accepts only the
  expected JSON shape and writes only the fixed About data file.
- Reuse the Studio's 800ms debounced saving and save-status feedback.

## Avatar Asset

- Generate a square PNG with a simple round white face, large outlined eyes,
  and an original deep-charcoal / restrained-blue circular frame.
- Save it as a project asset under `public/images/profile/`; the JSON file uses
  its base-aware public path.

## Verification

1. Run `npm run build` and verify the About route.
2. Use the local site at desktop and 320px widths in both themes.
3. Start Studio, edit an About field and the extension body, then verify the
   saved JSON and rendered page.
4. Confirm article creation, editing, and preview still work.
