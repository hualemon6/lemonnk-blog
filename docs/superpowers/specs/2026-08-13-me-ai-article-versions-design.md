# ME / AI article versions

## Goal

Let one public article present either an author-written edition (ME), an
AI-authored edition (AI), or both editions without turning LemonNK Studio into
a CMS.

## Content model

Posts keep their existing Markdown file and shared frontmatter. A new optional
`mode` frontmatter value is `me`, `ai`, or `dual`; missing values mean `me` so
existing posts remain compatible. The main post file contains the ME body for
ME and dual posts, and the AI body for AI-only posts. The second body of a dual
post lives in `src/content/posts/_versions/<slug>.ai.md`, outside Astro's post
collection. Only the body varies; title, slug, date, tags, draft status, and
navigation remain shared.

## Studio

New Article opens a calm modal with an explicit three-way control: ME, AI, or
ME + AI. Markdown upload is an optional initializer, not a workflow: a
single-version article has one drop zone, while a dual article has one compact
drop zone per edition. New articles obtain metadata from frontmatter when it is
present, otherwise from the filename; later version uploads only replace that
version's body.

In the editor, a dual post has one Markdown editor and a quiet ME/AI switch.
The selected tab identifies the body currently being edited; shared metadata
does not change. A single-version post exposes an additive action (`Add AI
version` or `Add ME version`). Removing an existing second body needs an
explicit confirmation.

## Reader

Single-version posts show a small ME or AI circular marker beside the metadata.
Dual posts show an animated ME/AI segmented slider and default to ME. Switching
changes no URL or metadata and preserves the reader's scroll position. The
slider moves in roughly 240 ms; content makes a restrained fade-and-lift
transition and honours reduced-motion preferences.

## Existing posts

`math-formula-test` (接雨水) is declared dual in `src/data/post-editions.json`,
with its existing body preserved as ME and an intentionally blank AI companion
ready for later upload or editing. This compatibility mapping avoids modifying
an in-progress article body; once saved through Studio, the post's own
frontmatter becomes the source of truth. All other current posts remain ME
through the backwards-compatible default.

## Verification

Run the production build and verify: single ME markers, the dual switch and
empty AI state, Studio creation/import flows, version editing and persistence,
and safe removal of a secondary version.
