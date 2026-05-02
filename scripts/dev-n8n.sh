#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUNNER_DIR="${PROJECT_ROOT}/.n8n-runner"
USER_FOLDER="${PROJECT_ROOT}/.n8n-node-cli"
N8N_VERSION="2.14.2"

"${SCRIPT_DIR}/prepare-dev-package.sh"

mkdir -p "${RUNNER_DIR}"

if [ ! -f "${RUNNER_DIR}/package.json" ]; then
	npm init -y --silent --prefix "${RUNNER_DIR}" >/dev/null
fi

INSTALLED_VERSION=""
if [ -f "${RUNNER_DIR}/node_modules/n8n/package.json" ]; then
	INSTALLED_VERSION="$(node -p "require('${RUNNER_DIR}/node_modules/n8n/package.json').version")"
fi

if [ "${INSTALLED_VERSION}" != "${N8N_VERSION}" ]; then
	npm install --prefix "${RUNNER_DIR}" "n8n@${N8N_VERSION}"
fi

cd "${RUNNER_DIR}"
if [ -n "${N8N_DEBUG_PORT:-}" ]; then
	N8N_DEV_RELOAD=true N8N_USER_FOLDER="${USER_FOLDER}" node "--inspect=${N8N_DEBUG_PORT}" ./node_modules/n8n/bin/n8n start
else
	N8N_DEV_RELOAD=true N8N_USER_FOLDER="${USER_FOLDER}" ./node_modules/.bin/n8n start
fi
