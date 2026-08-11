# Avatar image optimization

## Goal

Reduce the transfer size of the two profile images served by GitHub Pages without changing the visible avatar layout.

## Design

- Produce one 360 by 360 pixel WebP asset from each existing PNG.
- Use a centered square crop, matching the current CSS `object-fit: cover` and `object-position: center` rendering.
- Replace only the two avatar paths: the home-page image and the about-page image.
- Remove the superseded PNG files so the published site does not retain their transfer and repository cost.

## Verification

- Confirm the generated assets' dimensions and file sizes.
- Build the Astro project successfully.
- Visually preserve the existing circular, 180 pixel avatar presentation at desktop and mobile sizes.
