# AGENTS.md

These instructions apply to the complete `thoth-pub/metrics-widget` repository.

This file **specializes** the canonical Shared Engineering Control doctrine for this
repository. It does not replace it. The canonical doctrine lives in `thoth-pub/thoth`:

- root `AGENTS.md`;
- `docs/engineering/ai-delivery/`;
- `docs/engineering/repository-map/`.

Where this file is silent, the canonical doctrine applies. Where this file is more
restrictive, the more restrictive rule applies. This file must never be read as
relaxing a canonical control.

A more deeply nested `AGENTS.md` adds or narrows instructions for its directory.
Read this file and every applicable nested file before editing.

## 1. Required task identity

Before changing anything, record:

```text
Programme:
Owning GitHub issue:
Repository: thoth-pub/metrics-widget
Task ID:
Approved specification:
Risk: LOW | MEDIUM | HIGH | CRITICAL
Base branch and exact base commit:
PR target:
Task branch:
Dependencies:
Authorized write paths (existing files):
Authorized new-file paths:
Prohibited paths:
Action authorization: see section 5
Cross-repository impact: see section 5.1
Implementing agent/model:
Independent reviewer/model:
```

Do not implement without an approved written specification. A GitHub issue is
sufficient only when it contains the information required by
`docs/engineering/ai-delivery/task-specification-template.md` in `thoth-pub/thoth`,
including an explicit write budget and action-authorization matrix.

If any item is unknown, treat it as missing work.

GitHub is the live task ledger for this repository: the owning issue, its linked
pull request, review threads and CI hold current lifecycle state.

## 2. Authority

Use this order when sources conflict:

1. merged code and configuration in this repository, and the published package;
2. approved ADRs and technical designs in `thoth-pub/thoth`;
3. approved task specifications;
4. GitHub issues, pull requests, review threads and CI evidence;
5. programme-control and rollout documents;
6. agent reports and conversations.

Do not allow chat history or memory to silently override repository evidence.

Stop and escalate when authoritative sources conflict.

## 3. Repository responsibilities

This repository owns:

- the **public, embeddable `metrics-widget` package** — a React/JavaScript
  component for displaying publication metrics for DOI-identified works;
- its **public package interface**: exported components, props, the typed `theme`
  prop, CSS custom properties, bundled stylesheet and type declarations;
- its published entry points and `exports` map;
- its rendering, visualization and client-side data-fetching behaviour;
- its build, lint and packaging configuration.

This is a **public package**. Its consumers are external as well as internal, and
its interface is a shared contract (section 5.1).

### 3.1 Explicit non-responsibilities

This repository **does not own**, and must not be treated as the authority for:

- the **Thoth GraphQL schema, resolvers or authorization policy** — owned by
  `thoth-pub/thoth`;
- the **OPERAS metrics API contract**, its measure identifiers or its response
  semantics — owned externally by OPERAS;
- the Metrics dashboard application — owned by `thoth-pub/metrics-dashboard`;
- consuming applications' integration code, including `thoth-pub/thoth-pyramid`;
- Metrics product architecture decisions.

This repository is a **consumer** of the upstream APIs. If widget work appears to
require a Thoth GraphQL or OPERAS metrics contract change, that is upstream work in
the owning repository under its own bounded task — return HOLD.

Thoth Metrics product and architecture work is tracked separately under
`thoth-pub/thoth#766`. Control work here does not authorize Metrics product
implementation or client cutover.

## 4. Branch and pull-request workflow

Current **actual** topology:

```text
dev -> feature/<area>/<task> -> dev
dev -> main   (default / release)
```

Verified branch facts:

- `dev` is the **active development branch** and the normal base for new work;
- `main` is the **default and release branch**.

**Branch normalization is separate work, tracked as `BR-WIDGET-01`.** Nothing in
this file asserts that normalization has occurred. Until `BR-WIDGET-01` completes,
the topology above is the accurate description of this repository, including its
`dev`/`main` naming divergence from `thoth-pub/thoth`'s `develop`/`master`. A task
must not perform branch normalization or default-branch changes as a side effect of
unrelated work.

Rules:

- verify the actual base commit immediately before branching, and record it;
- branch from the **exact authorized base SHA**, not from a branch name alone;
- if the base has moved since authorization, **stop** and return HOLD rather than
  silently rebasing onto a newer head;
- use one bounded task per branch and PR;
- do not target normal implementation directly at `main`;
- do not merge or approve your own work;
- do not rewrite shared branch history after others depend on it.

## 5. Granular action authorization

Authorization is granted action-by-action and is **not transitive**. Authorization
for one action never implies authorization for another. A task's specification or
implementation-handoff prompt must state exactly which actions are authorized. Any
action not explicitly authorized is **denied by default**.

Distinct actions:

- repository/GitHub read inspection;
- source/worktree modification within the approved write budget;
- creation of new files at explicitly authorized paths;
- deletion, move or rename of files;
- branch creation;
- commit;
- push;
- pull-request creation/update;
- issue/comment mutation;
- manual CI dispatch or rerun;
- version change;
- tag creation;
- GitHub release creation or publication;
- npm publication;
- merge;
- deployment;
- production activation.

Without limiting the list above:

- source-write authorization does not include commit authorization;
- commit authorization does not include push authorization;
- push authorization does not include pull-request mutation authorization;
- repository-write authorization does not include GitHub issue/comment mutation
  authorization;
- package-source authorization does not include version-change authorization;
- version-change authorization does not include tag, release or publication
  authorization;
- merge authorization does not include release or publication authorization.

An implementing agent must not:

- merge a PR;
- mark a draft PR ready for review;
- approve its own work;
- change the package version;
- create a tag or a GitHub release;
- publish to npm;
- dispatch, rerun or cancel CI;
- access registry credentials or repository secrets;
- broaden scope, write budget or action authorization without an approved
  specification update;
- change the public package interface silently.

### 5.1 Cross-repository impact and downstream consumers

This repository publishes a **public package contract**. Before scope affecting that
contract — exported components, props, `theme` shape, CSS custom properties,
stylesheet paths, `exports` map, type declarations, peer-dependency ranges or
supported consumer patterns — is approved, identify known consumers from
`docs/engineering/repository-map/contracts.md` in `thoth-pub/thoth` and record
whether each requires a change or remains compatible and why.

**Verified downstream package consumer:**

- **`thoth-pub/thoth-pyramid`** depends on the published package
  `metrics-widget` at `^2.0.1`.

**Release-before-downstream-consumption ordering.** Where a change requires a
package release, the ordering is strict:

1. the widget change merges;
2. a separately authorized release publishes the new version to npm;
3. only then may a downstream repository (for example Pyramid) update its
   dependency to consume it.

A downstream repository must **never** guess an unpublished or unmerged package
interface, and must never depend on a version that does not exist on the registry.
Consuming a change ahead of its release is a control failure, not a shortcut.

This repository is also a **verified consumer of the public Thoth GraphQL schema**
and of the **public OPERAS metrics API**. Breaking upstream changes require impact
assessment here.

Never give one implementing agent unrestricted write access to more than one
repository for the same task. Each affected repository gets its own bounded task,
branch and pull request, independently reviewed.

## 6. Stack and consumer compatibility

Verified current stack:

- **React 19** as a peer dependency (`react`/`react-dom` `^19.2.0`);
- **TypeScript**;
- **Vite** library build, with `vite-plugin-dts` and API Extractor for type output;
- **Biome** for linting (`biome lint .`);
- Tailwind CSS v4 (with `postcss-prefixwrap` for style isolation), Radix UI,
  Base UI, Recharts, TanStack Query, `graphql-request`.

### 6.1 Consumer compatibility responsibility

The package must keep working for **both** supported consumer patterns:

- **React consumers** installing `metrics-widget` from npm and importing the
  component and its stylesheet;
- **vanilla-JavaScript consumers**, including bundler-less CDN usage that relies on
  an import map to resolve React, and the published ESM entry point and stylesheet.

A change that only preserves the React path is **not** sufficient. Verify both, and
preserve the documented entry points, stylesheet paths and `exports` map. Style
isolation exists so the widget does not leak styles into host pages — do not weaken
it.

Peer-dependency ranges are part of the public contract. Do not widen or narrow them
incidentally.

Do not add, upgrade or remove dependencies as an incidental side effect of an
unrelated task.

## 7. Validation

Currently supported checks:

```bash
npm ci
npm run lint
npm run build
npm run test:consumer
```

Where packaging is affected, also:

```bash
npm pack --dry-run
```

`npm run test:consumer` performs a consumer smoke test: it packs the package,
installs the resulting tarball into a temporary project and exercises it as a real
consumer would. Treat it as the primary guard for section 6.1 and run it for any
change touching the build, exports, packaging or public interface.

For a documentation-only change, at minimum:

```bash
git diff --check
```

Record the exact commands run and their concise results. Do not report only
"checks passed". A check that was not run must be reported as not run, never
implied to have passed.

Note: there is currently **no unit-test suite**. `test:consumer` is a packaging and
integration smoke test, not unit coverage. Adding a unit-test suite is separate work.

## 8. CI, release and publication

These are **distinct pipelines** and must never be conflated.

### 8.1 Ordinary pull-request CI

`.github/workflows/ci.yml` runs on pull requests and on pushes to `main` and `dev`.
It installs dependencies and runs lint, build and the consumer smoke test, with
`contents: read` permission.

> **Ordinary PR CI does not publish an npm package.** Opening or updating a pull
> request runs verification only. Allowing and observing this automatic CI is
> normal and expected.

### 8.2 npm publication

`.github/workflows/publish.yml` runs on **`release: published`**. It verifies that
the release tag matches the `package.json` version (expecting `v<version>`), runs
lint, build, `npm pack --dry-run` and the consumer smoke test, and then runs
`npm publish` using trusted publishing (`id-token: write`).

> **A published GitHub release can therefore publish this package to npm.**

Consequences:

- **version changes, tag creation, GitHub release creation and npm publication are
  separately authorized HIGH-impact actions.** They are never implied by
  authorization to modify source, commit, push, open a PR, or merge;
- publication is **externally irreversible in practice**: a published npm version
  cannot be meaningfully retracted, and downstream consumers may install it
  immediately;
- an implementing agent must not create a release or tag, must not bump the
  version, and must not invoke `npm publish`;
- do not modify the release or publication workflows without explicit
  authorization; CI/release-workflow modernization is separate work.

If a task appears to require a release in order to be useful downstream, **stop**
and request separate release authorization. Do not release to unblock yourself.

## 9. Data and credential boundaries

The widget currently consumes two **public** upstream APIs from the browser:

- the **Thoth GraphQL API** for bibliographic metadata;
- the **OPERAS metrics API** for usage/metrics measures.

Endpoint configuration is supplied through build-time `VITE_*` variables
(`VITE_THOTH_API_URL`, `VITE_METRICS_API_URL`). Treat every `VITE_*` value as
**fully public**: Vite inlines them into the built bundle, and this package ships
that bundle to third-party host pages.

> **Never embed a machine credential, service credential, API key, client secret,
> bearer token or long-lived access token in package code, in browser-delivered
> code, in a `VITE_*` variable, or in any published artefact.**

This prohibition is absolute. It is strengthened here by distribution: anything
committed to this package is published to a public registry and executed on host
pages the project does not control. A credential committed here must be treated as
compromised.

If protected or authenticated Metrics access is ever required, it must be designed
with a server-side boundary that keeps the credential off the client. That design
requires its own approved specification under the Metrics programme; it is not a
widget implementation detail.

Do not log tokens, secrets, raw credentials or unbounded upstream response bodies.

## 10. Change-specific evidence

### Documentation or control-file change

Verify:

- `git diff --check`;
- the whole-task diff contains exactly the authorized paths and nothing else;
- no existing file is modified, deleted, moved or renamed outside the write budget;
- internal links, paths, repository names and terminology;
- every factual statement against live repository, workflow and source evidence;
- that branch, release and publication wording describes the **current** state and
  does not claim normalization or modernization has already occurred.

### Public-interface or packaging change

Also prove, before review:

- React consumer compatibility;
- vanilla-JavaScript/CDN consumer compatibility;
- `npm run test:consumer` result;
- `npm pack --dry-run` contents;
- the downstream impact on `thoth-pub/thoth-pyramid`;
- whether a release is required, and that release authorization is separate.

## 11. Implementation report

Before review, produce a report following
`docs/engineering/ai-delivery/implementation-report-template.md` in `thoth-pub/thoth`,
including:

- programme, task ID, owning issue and repository;
- authorized base and actual base commit;
- task branch and pull request;
- exact head commit and the commits contained;
- files changed;
- exact validation commands and results;
- CI status evidence;
- automatic external effects actually observed;
- runtime/API/package-interface effect;
- migration/data effect;
- auth/security implementation effect;
- provider/runtime mutation;
- release/publication effect;
- deviations from the authorized scope;
- deferred gaps;
- remaining gates.

State `NONE` explicitly where a category does not apply. Do not omit a category.

The implementing agent may provide a self-assessment but **may not issue the
approval decision**.

## 12. Independent review

Every pull request requires a **fresh, independent review of the exact PR head
commit** by a reviewer other than the implementing agent.

- review must be performed against the exact head SHA, not against a description,
  a summary, or an earlier revision;
- if the head moves after review, the review is stale and must be repeated;
- the implementing agent must not approve its own work, mark the PR ready for
  review, or merge it;
- pull requests opened by an implementing agent remain **DRAFT** until a human or
  separately authorized reviewer decides otherwise.

## 13. Stop conditions

Return `HOLD` or `BLOCKED` — do not improvise — when:

- the approved specification is absent or incomplete;
- the authorized base branch does not exist, or has moved since authorization;
- an expected new file already exists unexpectedly;
- a file outside the approved write budget must change;
- branch normalization would be required;
- a version, package-interface or public-export change would be required;
- a tag, GitHub release or npm publication would be required;
- registry credentials or repository secrets would be required;
- a release or publication is triggered unexpectedly;
- a Thoth GraphQL or OPERAS metrics contract change would be required;
- an unmerged upstream contract or unpublished package version would have to be
  guessed;
- a downstream consumer would break without a released version to consume;
- repository state differs materially from the task premise;
- an unexpected external or automatic effect occurs;
- a cross-programme decision is required.

When stopping, record what was observed, what was expected, and what decision is
needed. Do not expand scope to work around a stop condition.
