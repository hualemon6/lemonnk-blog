# Public Site Refinement Design

## Goal

Refine the public-facing Astro blog into a quieter editorial site. Remove
template-like explanatory copy, improve the About page, and correct verified
routing and mobile-layout defects. The local Studio is explicitly out of scope.

## Content Direction

- The home page presents `LemonNK`, social links, and the article list. It has
  no welcome sentence or generic self-description.
- The About page becomes a compact identity block: name, university, and
  discipline. It removes forward-looking placeholder copy.
- The Projects page removes its introductory paragraph and the account-level
  GitHub link. Each project keeps one concise, factual description, its tech
  line, its metric when available, and a single title link to GitHub.
- Article and site `description` fields are removed rather than merely hidden.
  The in-progress content of `math-formula-test.md` is otherwise left intact.

## Layout and Interaction

- Keep the existing type-first, single-column visual system and design tokens.
- On narrow screens, the header uses a separate navigation row beneath the
  identity and controls. This prevents the 320px horizontal overflow in both
  Chinese and English while retaining all four navigation destinations.
- Theme and language controls remain persistent; their accessible labels use
  the existing i18n mechanism.
- About uses restrained editorial spacing, a small label, a large name, and a
  factual metadata line rather than cards or decorative effects.

## Functional Corrections

- Build every internal tag link with `path()` so GitHub Pages retains the
  `/lemonnk-blog/` base path.
- Exclude draft posts before deriving tag counts and static tag routes.
- Apply the existing external-link policy to static social links and Markdown
  content: open external destinations in a separate tab with `noopener
  noreferrer`.
- Upgrade Astro and its lockfile to a non-vulnerable release, aligning the
  GitHub Actions Node version with the upgraded Astro engine requirement.

## Implementation Boundaries

- No Studio files or APIs are changed.
- No UI framework, remote font, card grid, gradient, or animation is added.
- Existing project descriptions are edited for concision; they are not replaced
  with generated prose or expanded case studies.
- No commit or push is part of this work unless explicitly requested.

## Verification

1. Install the updated locked dependencies and run `npm run build`.
2. Check generated tag-index links include `/lemonnk-blog/`.
3. Verify draft-only tags do not produce index entries or routes.
4. Inspect the local build at desktop and 320px-wide mobile sizes in both
   languages and themes; confirm no horizontal document overflow.
5. Check browser console output and external-link attributes on rendered pages.
