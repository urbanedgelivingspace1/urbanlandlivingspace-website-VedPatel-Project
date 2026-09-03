# Privacy helpers

`public-location.ts` is the single server-compatible public location transformer. Its input type
contains public coordinates only: private exact coordinates must not be queried into a public DTO
and then removed in the browser. SQL and TypeScript canary tests enforce this boundary.
