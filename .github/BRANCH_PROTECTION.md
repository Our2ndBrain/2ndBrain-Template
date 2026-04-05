# Branch Protection Setup

The workflow and ownership files in this repository provide automation primitives, but GitHub branch protection and environment protection still need one-time repository configuration.

## Protect `main`

Configure `main` with these rules:

- Require a pull request before merging
- Require conversation resolution before merge
- Require status checks to pass before merge
- Allow auto-merge so the final confirmation can be a single tap in GitHub Mobile
- Block force pushes and branch deletion
- Do not allow bypassing these rules for administrators unless you explicitly need an emergency escape hatch

Recommended required checks:

- `PR Checks (Node 18.x)`
- `PR Checks (Node 20.x)`
- `PR Checks (Node 22.x)`
- `PR Checks (Node 24.x)`
- `Dependency Review`
- `Workflow Sanity`
- `CodeQL / Analyze (javascript-typescript)`

## Protect `npm-release` environment

Create a GitHub environment named `npm-release` and configure:

- Required reviewers: `@pwkuan`
- Deployment branches: protected branches only
- npm trusted publishing for package `@our2ndbrain/cli` must point to `.github/workflows/release.yml`

## Release flow

1. Run one command from any clean local branch:
   - `npm run release -- stable`
   - `npm run release -- beta`
   - `npm run release -- hotfix`
2. The release script creates a temporary `codex/release-*` branch from `origin/main`, opens a normal ready-for-review PR, enables auto-merge, and waits for required checks plus the squash merge commit.
3. After merge, the script retags the merge commit, dispatches `.github/workflows/release.yml` from `main`, approves `npm-release` automatically when the current `gh` user is an allowed reviewer, verifies npm/GitHub Release output, then switches back to the original branch.
