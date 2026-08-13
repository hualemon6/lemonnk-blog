# Studio preview startup repair

## Goal

Make LemonNK Studio previews open promptly and show a useful error when the
local Astro server cannot start.

## Design

The Studio server will launch Astro through its installed CLI entry point
instead of the nonexistent `node_modules/astro/astro.js` path. Preview startup
will keep using port 4321 and the configured Astro base path.

Before launching a process, the server will check whether an Astro server is
already responding on that port and reuse it. On a new launch, the server will
capture the child process's startup output. If it exits before becoming ready,
the preview API will return that error immediately instead of waiting for the
40-second readiness timeout.

## Error handling and verification

`POST /api/preview` will continue returning `{ ok, url }` and add an `error`
message only when startup fails. The Studio UI will display that message. Verify
with a fresh preview request for the `math-formula-test` (接雨水) post, confirm
the rendered URL returns HTTP 200, and run `npm run build`.
