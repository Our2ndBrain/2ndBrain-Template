# Branch Protection Setup

The workflow and ownership files in this repository provide automation primitives, but GitHub branch protection and environment protection still need one-time repository configuration.

## Protect `main`

Configure `main` with these rules:

- Require a pull request before merging
- Require at least 1 approval
- Require review from Code Owners
- Dismiss stale approvals when new commits are pushed
- Require conversation resolution before merge
- Require status checks to pass before merge
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
- Deployment branches: protected branches and release tags only
- npm trusted publishing for package `@our2ndbrain/cli` must point to `.github/workflows/release.yml`

## Release flow

1. Merge release-prep PR into `main`
2. Create and push a tag such as `v1.2.3` or `v1.2.3-rc.1`
3. Wait for `Release` preflight checks
4. Approve the `npm-release` environment deployment
5. Verify npm package provenance and GitHub Release artifacts
