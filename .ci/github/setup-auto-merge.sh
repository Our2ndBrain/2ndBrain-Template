#!/usr/bin/env bash
# Minimal GitHub auto-merge + branch protection setup.

set -euo pipefail

usage() {
  cat <<'HELP'
setup-auto-merge.sh

一键配置 GitHub 仓库的 PR 自动合并基础能力：
1) 开启仓库级别 auto-merge
2) 配置分支保护（required checks + required approvals）

USAGE
  bash .ci/github/setup-auto-merge.sh --checks "CI / test,CI / lint,Codex Review" [options]

REQUIRED
  --checks <csv>         必填。逗号分隔的 required check 名称。
                         示例："CI / test,CI / lint,Codex Review"

OPTIONS
  --repo <owner/name>    可选。目标仓库，默认自动检测当前 git 仓库。
  --branch <name>        可选。目标分支，默认：main。
  --approvals <number>   可选。所需审批数，默认：1。
  --merge <method>       可选。仅用于最后提示命令，默认：squash。
                         可选值：squash | merge | rebase。
  --doctor               检查本地依赖并给出安装建议。
  -h, --help             显示帮助。

PREREQUISITES
  - 已安装并登录 gh CLI（gh auth login）
  - 已安装 jq
  - 当前账号对目标仓库拥有 admin 权限（才能改 repo 设置和 branch protection）


DEPENDENCY QUICK INSTALL (参考)
  gh:
    - macOS (Homebrew): brew install gh
    - Ubuntu/Debian:    sudo apt update && sudo apt install -y gh
    - Windows (winget): winget install --id GitHub.cli
  jq:
    - macOS (Homebrew): brew install jq
    - Ubuntu/Debian:    sudo apt update && sudo apt install -y jq
    - Windows (winget): winget install jqlang.jq

WHAT THIS SCRIPT CHANGES
  - Repository setting: Allow auto-merge = enabled
  - Branch protection on <branch>:
    - Require pull request reviews (approvals)
    - Require status checks to pass (checks from --checks)
    - Dismiss stale reviews = true
    - Required conversation resolution = true
    - Force push / deletion = disabled

EXAMPLES
  # 最简用法（自动识别当前仓库，分支 main，审批 1）
  bash .ci/github/setup-auto-merge.sh \
    --checks "CI / test,CI / lint,Codex Review"

  # 指定仓库和分支
  bash .ci/github/setup-auto-merge.sh \
    --repo your-org/your-repo \
    --branch main \
    --approvals 2 \
    --merge squash \
    --checks "CI / test,CI / lint,Codex Review"

AFTER SETUP
  这个脚本只配置“自动合并能力”和“保护规则”。
  具体某个 PR 仍需启用 auto-merge：

  gh pr merge <PR_NUMBER> --repo <owner/name> --auto --<merge_method>

  例如：
  gh pr merge 123 --repo your-org/your-repo --auto --squash

TIPS
  - --checks 名称必须与 GitHub Checks 页面显示的名称完全一致。
  - 若仓库启用了 Rulesets 而不是传统 branch protection，规则可能冲突，需要在 GitHub 后台统一配置。
HELP
}

print_install_hint() {
  local cmd="$1"
  local os
  os="$(uname -s)"

  echo "缺少依赖: $cmd"
  case "$os" in
    Darwin)
      if [[ "$cmd" == "gh" ]]; then
        echo "安装建议: brew install gh"
      else
        echo "安装建议: brew install jq"
      fi
      ;;
    Linux)
      if command -v apt >/dev/null 2>&1; then
        echo "安装建议: sudo apt update && sudo apt install -y $cmd"
      elif command -v dnf >/dev/null 2>&1; then
        echo "安装建议: sudo dnf install -y $cmd"
      elif command -v pacman >/dev/null 2>&1; then
        echo "安装建议: sudo pacman -S --noconfirm $cmd"
      else
        echo "请使用你的发行版包管理器安装: $cmd"
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*)
      if [[ "$cmd" == "gh" ]]; then
        echo "安装建议: winget install --id GitHub.cli"
      else
        echo "安装建议: winget install jqlang.jq"
      fi
      ;;
    *)
      echo "请参考官方文档安装: $cmd"
      ;;
  esac
}

check_dependency() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    print_install_hint "$cmd"
    return 1
  fi
}

run_doctor() {
  local ok=0
  echo "🩺 Dependency doctor"

  if check_dependency gh; then
    echo "✅ gh: $(command -v gh)"
  else
    ok=1
  fi

  if check_dependency jq; then
    echo "✅ jq: $(command -v jq)"
  else
    ok=1
  fi

  if command -v gh >/dev/null 2>&1; then
    if gh auth status >/dev/null 2>&1; then
      echo "✅ gh auth: logged in"
    else
      echo "⚠️ gh auth: not logged in (run: gh auth login)"
      ok=1
    fi
  fi

  return $ok
}

REPO_SLUG=""
BRANCH="main"
APPROVALS="1"
MERGE_METHOD="squash"
CHECKS_CSV=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO_SLUG="${2:-}"; shift 2 ;;
    --branch) BRANCH="${2:-}"; shift 2 ;;
    --approvals) APPROVALS="${2:-}"; shift 2 ;;
    --merge) MERGE_METHOD="${2:-}"; shift 2 ;;
    --checks) CHECKS_CSV="${2:-}"; shift 2 ;;
    --doctor) run_doctor; exit $? ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1"; echo; usage; exit 1 ;;
  esac
done

check_dependency gh || exit 1
check_dependency jq || exit 1

if [[ -z "$REPO_SLUG" ]]; then
  REPO_SLUG="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi

if [[ -z "$REPO_SLUG" ]]; then
  echo "❌ Cannot detect repo. Provide --repo owner/name"
  exit 1
fi

if [[ -z "$CHECKS_CSV" ]]; then
  echo "❌ --checks is required, e.g. --checks \"CI / test,Codex Review\""
  echo
  usage
  exit 1
fi

if ! [[ "$APPROVALS" =~ ^[0-9]+$ ]]; then
  echo "❌ --approvals must be a non-negative integer"
  exit 1
fi

case "$MERGE_METHOD" in squash|merge|rebase) ;; *)
  echo "❌ --merge must be squash|merge|rebase"; exit 1 ;;
esac

OWNER="${REPO_SLUG%/*}"
REPO="${REPO_SLUG#*/}"

CHECKS_JSON="$(jq -cn --arg csv "$CHECKS_CSV" '$csv | split(",") | map(gsub("^\\s+|\\s+$"; "")) | map(select(length > 0)) | map({context: ., app_id: -1})')"

if [[ "$CHECKS_JSON" == "[]" ]]; then
  echo "❌ --checks parsed to empty list. Please provide at least one check name."
  exit 1
fi

echo "🔐 Verifying gh auth..."
gh auth status >/dev/null

echo "🧩 Enable auto-merge: $REPO_SLUG"
gh repo edit "$REPO_SLUG" --enable-auto-merge

echo "🛡️  Apply branch protection: $BRANCH"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/branches/$BRANCH/protection" \
  --input - <<JSON >/dev/null
{
  "required_status_checks": { "strict": true, "checks": $CHECKS_JSON },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": $APPROVALS,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

echo "✅ Done"
echo "Next: gh pr merge <PR_NUMBER> --repo $REPO_SLUG --auto --$MERGE_METHOD"
