# 2. The engine lives in this repo, in `engine/`

Date: 2026-10-02
Status: Accepted

## Context

The project will have two code bases: the web app (TypeScript, Next.js, already
in this repo at the root) and the conversation engine (Python, not yet written).
They share a contract: the shape of the client events the engine emits
(`state`, `cue`, `hint_cloud`, `word_update`, `scene_end`) and the web app renders.

If the two sides disagree on that shape, nothing crashes: the web app simply
finds no data and shows nothing. The failure is silent at runtime.

The web app's future stack is undecided. The product spec chooses React + Vite
for the frontend (M4); the current app is Next.js.

## Decision

1. **One repo (monorepo), not two.** Both repo layouts can catch contract drift,
   but a polyrepo needs extra machinery (a versioned contract package, or
   contract tests across repos; see https://martinfowler.com/bliki/ContractTest.html).
   In one repo, a single test can compare both sides, and a contract change and
   both sides' updates go in one commit. For a solo developer this is the
   cheaper way to the same safety.
2. **The engine goes in `engine/`; the web app stays at the root.** Moving the
   web app into `web/` is a cheap, reversible step (`git mv`, Amplify `appRoot`,
   one README line). It is deferred until the frontend decision at M4: if the
   frontend is rebuilt, it goes straight into `web/` and the move is never needed.

## Consequences

- Two toolchains in one repo (Node/npm and Python/uv); CI must set up both.
- `tsconfig.json`'s `include` (`**/*.ts`) would match files under `engine/`, so
  `"engine"` is added to its `exclude`. Files there that the web app imports are
  still type-checked (https://www.typescriptlang.org/tsconfig/#exclude).
- The top level mixes web app files with `engine/` until the move; the README
  documents the layout.
- Revisit at M4 together with the frontend stack decision.
