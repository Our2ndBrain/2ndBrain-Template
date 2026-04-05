# Workflow Strategy

The workflows in this directory are split so pull requests get fast review signal, while `main` drives post-merge verification and releases.

## Pull Requests

- `ci.yml` runs lint, unit tests, and package dry-run checks on Node 18/20/22/24.
- `dependency-review.yml` blocks vulnerable or disallowed dependency changes.
- `codeql.yml` runs JavaScript/TypeScript code scanning.
- `workflow-sanity.yml` validates workflow syntax and enforces action SHA pinning.
- `labeler.yml` applies coarse-grained area labels for reviewer triage.
- Pull requests should be opened as normal ready-for-review PRs, not draft PRs, so the final human action on GitHub Mobile is a single **Auto-merge** tap.

## Post-Merge On `main`

- `main-regression.yml` reruns tests on Ubuntu, macOS, and Windows, then installs the packed tarball and exercises the CLI entrypoints.
- `codeql.yml` reruns code scanning on the merged commit.

## Release

- `release.yml` is dispatched from `main`, validates tag/version/changelog metadata, builds a publish tarball, waits for `npm-release` environment approval, publishes to npm with provenance, and creates or updates the GitHub Release.
- Release operators run one local command from any clean local branch after `gh auth login`: `npm run release -- stable`, `npm run release -- beta`, or `npm run release -- hotfix`.
- Local release versions use date-based tags: `vYYYY.M.D`, `vYYYY.M.D-beta.N`, and `vYYYY.M.D-N`. The release script creates a temporary release branch from `origin/main`, opens a ready-for-review PR, enables auto-merge, waits for the squash merge commit, tags that merge commit, dispatches `release.yml` from `main`, approves `npm-release` when the current `gh` user is allowed, verifies npm/GitHub Release publication, and switches back to the original branch.
