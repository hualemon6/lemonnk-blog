# Avatar crop refinement

## Goal

Reduce the apparent thickness of the avatar's black edge while retaining the existing CSS frame and WebP optimization.

## Design

- Re-crop both 360 by 360 WebP assets from the same centered source region at a 1.2x scale.
- Preserve the avatar subject's center and aspect ratio.
- Do not change page markup or CSS; the existing 5 pixel circular frame remains the only intentional outer border.

## Verification

- Inspect the output at 180 by 180 pixels to ensure the face is not clipped.
- Confirm the image dimensions remain 360 by 360 pixels and file sizes stay small.
- Build the Astro project successfully.
