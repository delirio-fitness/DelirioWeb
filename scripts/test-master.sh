#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export CI=1

usage() {
  cat <<'EOF'
Usage: ./scripts/test-master.sh [suite ...]

Suites:
  all          Jest + accessibility + MSW + types + lint + build (default)
  jest         All Jest tests
  ui           React Testing Library component and page tests
  a11y         jest-axe accessibility tests
  msw          MSW-backed feedback integration tests
  unit         Hook and utility unit tests
  types        TypeScript validation
  lint         ESLint validation
  build        Production build
  quality      Types + lint
  file PATH    Run one specific Jest test file
  list         Show available suites

Multiple suites can be combined:
  ./scripts/test-master.sh ui a11y lint
EOF
}

run_jest() {
  npx jest --runInBand --silent --watchman=false "$@"
}

run_suite() {
  case "$1" in
    all)
      run_jest
      npx tsc --noEmit --pretty false
      npx eslint src --quiet
      npx vite build --logLevel error
      ;;
    jest)
      run_jest
      ;;
    ui)
      run_jest --testPathPatterns='src/(components|pages)/.*\.test\.tsx$' --testPathIgnorePatterns='\.a11y\.test\.tsx$'
      ;;
    a11y|accessibility)
      run_jest --testPathPatterns='\.a11y\.test\.tsx$'
      ;;
    msw|integration)
      run_jest --runTestsByPath src/components/landing/FeedbackSection.test.tsx
      ;;
    unit)
      run_jest --testPathPatterns='src/(hooks|utils)/.*\.test\.(ts|tsx)$'
      ;;
    types|typecheck)
      npx tsc --noEmit --pretty false
      ;;
    lint)
      npx eslint src --quiet
      ;;
    build)
      npx vite build --logLevel error
      ;;
    quality)
      npx tsc --noEmit --pretty false
      npx eslint src --quiet
      ;;
    list|-l|--list)
      usage
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      printf 'Unknown suite: %s\n\n' "$1" >&2
      usage >&2
      return 2
      ;;
  esac
}

if [[ $# -eq 0 ]]; then
  set -- all
fi

while [[ $# -gt 0 ]]; do
  if [[ "$1" == "file" || "$1" == "--file" ]]; then
    if [[ $# -lt 2 ]]; then
      printf 'The file suite requires a test path.\n' >&2
      exit 2
    fi
    run_jest --runTestsByPath "$2"
    shift 2
    continue
  fi

  run_suite "$1"
  shift
done
