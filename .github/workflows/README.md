# Workflow Strategy

The workflows in this directory are split so pull requests get fast review signal, while `main` and release tags get heavier verification before publish.

## Pull Requests

- `ci.yml` runs lint, unit tests, and package dry-run checks on Node 18/20/22/24.
- `dependency-review.yml` blocks vulnerable or disallowed dependency changes.
- `codeql.yml` runs JavaScript/TypeScript code scanning.
- `workflow-sanity.yml` validates workflow syntax and enforces action SHA pinning.
- `labeler.yml` applies coarse-grained area labels for reviewer triage.

## Post-Merge On `main`

- `main-regression.yml` reruns tests on Ubuntu, macOS, and Windows, then installs the packed tarball and exercises the CLI entrypoints.
- `codeql.yml` reruns code scanning on the merged commit.

## Release

- `release.yml` validates tag/version/changelog metadata, builds a publish tarball, waits for `npm-release` environment approval, publishes to npm with provenance, and creates or updates the GitHub Release.
