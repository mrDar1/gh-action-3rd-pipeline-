# Lab: Practicing GitHub Actions Triggers

## Goal

In this lab you will take an existing CI workflow that runs on **every** push and
**every** pull request, and make it *precise*. You will learn to control exactly
*when* and *on what* your pipeline runs — by branch, by changed path, and by
pull-request activity type.

By the end, your workflow will:

- Run on `push` only to specific branches **and** only when relevant files changed
- Run on `pull_request` only against specific branches and only for specific
  activity types

This lab focuses purely on the `on:` block. You do **not** change the jobs.

---

## What you have

A real Node.js + TypeScript order-management REST API (Express). It is already a
working project with a green baseline.

```
src/
  domain/        order, pricing, validator, types (business rules)
  repositories/  in-memory order store
  services/      order use cases
  api/           Express routes + error middleware
  config/        environment config
  app.ts         app factory
  server.ts      entrypoint
tests/           unit + API tests (Jest + supertest)
.github/
  workflows/
    ci.yml       the workflow you will upgrade
```

Run it locally:

```bash
npm install
npm run lint       # ESLint over src/
npm run typecheck  # tsc --noEmit
npm run build      # compile to dist/
npm test           # Jest + coverage
```

### The existing workflow

`.github/workflows/ci.yml` already has three jobs — `lint`, `test` (Node 18 + 20
matrix), and `summary`. **Leave the jobs alone.** The current trigger is the
naive one:

```yaml
on:
  push:
  pull_request:
```

Your task: replace that block with a precise one.

---

## Background

### `push` event — branches and paths

The `push` event fires when commits are pushed to the repository. You can narrow
it with `branches:` and `paths:` filters:

```yaml
on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'src/**'
      - 'tests/**'
```

> **Important:** when `paths:` is set, the run is triggered **only** if at least
> one changed file matches one of the listed paths. A push that only touches
> `README.md` would **not** trigger this workflow.

> Branch and path filters combine with **AND** — the branch must match *and* at
> least one path must match.

You can also use glob patterns: `'feature/**'` matches every branch under
`feature/`. And you can *exclude* with `branches-ignore:` / `paths-ignore:` (but
you cannot use `branches` and `branches-ignore` for the same event at once).

---

### `pull_request` event — branches and activity types

The `pull_request` event fires on pull-request activity. Two useful filters:

**`branches:`** filters by the PR's *base* branch (the branch being merged into):

```yaml
on:
  pull_request:
    branches:
      - main
```

**`types:`** filters by *activity type*. A pull request emits many activity
types — `opened`, `synchronize` (new commits pushed to the PR), `reopened`,
`closed`, `edited`, `labeled`, and more.

```yaml
on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened
```

> **Default behavior:** if you omit `types:`, GitHub uses
> `[opened, synchronize, reopened]`. Specifying `types:` is how you opt into
> events the default does not cover (e.g. `closed`), or restrict to fewer.

`pull_request` also supports `paths:` — same semantics as for `push`.

---

### Combining multiple events

Each event is its own key under `on:`, with its own filters:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    types: [opened]
```

`push` and `pull_request` filters are independent — `types:` only applies to
`pull_request`, not to `push`.

---

## Instructions

Open `.github/workflows/ci.yml` and replace the `on:` block (steps 1–3).
Do not touch the jobs.

### Step 1 — Restrict `push`

Make `push` trigger **only** when:

- the pushed branch is `main` **or** `develop`, **and**
- at least one changed file is under `src/**` or `tests/**`

### Step 2 — Restrict `pull_request`

Make `pull_request` trigger **only** when:

- the PR targets the `main` branch, **and**
- the activity type is one of `opened`, `synchronize`, or `reopened`

### Step 3 — Keep the jobs unchanged

Confirm `lint`, `test`, and `summary` are exactly as before. This lab is only
about the `on:` block.

### Step 4 — Prove the filters work

After pushing your change, verify behavior:

1. **Path filter:** commit a change to `README.md` only, on `main` → the
   workflow should **not** run.
2. **Branch filter:** push a change under `src/` to a branch that is *not*
   `main`/`develop` (e.g. `feature/x`) → the workflow should **not** run.
3. **Valid push:** push a change under `src/` to `main` → the workflow
   **should** run.
4. **PR type:** open a PR against `main` → it runs. Add a label to the PR
   (activity type `labeled`) → it should **not** trigger a new run.

---

## Acceptance criteria

The `on:` block you write must:

- [ ] Trigger `push` only on branches `main` and `develop`
- [ ] Trigger `push` only when files under `src/**` or `tests/**` changed
- [ ] Trigger `pull_request` only against the `main` base branch
- [ ] Trigger `pull_request` only for types `opened`, `synchronize`, `reopened`
- [ ] Leave the `lint`, `test`, and `summary` jobs unchanged
- [ ] The workflow still passes (lint + typecheck + build + tests green) when it
      does run

---

## Hints

- Every event is an independent key under `on:`. `branches:`, `paths:`, and
  `types:` are nested *under their event* — `types:` is not valid under `push`.
- Filters within one event combine with AND: for `push`, the branch **and** a
  path must both match for the run to fire.
- A push that changes only `README.md` is the quickest way to confirm your
  `paths:` filter — if the workflow still runs, the filter is in the wrong place
  or wrong syntax.
- The default `pull_request` types are `[opened, synchronize, reopened]`. The
  lab asks for exactly those — but write `types:` explicitly so the intent is
  visible and so adding a label does not trigger a run.

---

## Where the workflow goes

Edit the existing file: `.github/workflows/ci.yml`. Do not create a new file.

---

## Resources

- [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [`push` event](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#push)
- [`pull_request` activity types](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
- [Filter pattern cheat sheet](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet)
