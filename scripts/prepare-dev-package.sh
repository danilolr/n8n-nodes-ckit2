#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEV_PACKAGE_DIR="${PROJECT_ROOT}/.n8n-dev-package"
USER_FOLDER="${PROJECT_ROOT}/.n8n-node-cli"
NODE_MODULES_DIR="${USER_FOLDER}/.n8n/custom/node_modules"
PACKAGE_NAME="$(node -p "require('${PROJECT_ROOT}/package.json').name")"
TARGET_LINK="${NODE_MODULES_DIR}/${PACKAGE_NAME}"

mkdir -p "${DEV_PACKAGE_DIR}" "${NODE_MODULES_DIR}"

node - <<'NODE' "${PROJECT_ROOT}" "${DEV_PACKAGE_DIR}"
const fs = require('fs');
const path = require('path');

const projectRoot = process.argv[2];
const devPackageDir = process.argv[3];
const pkg = require(path.join(projectRoot, 'package.json'));

const cleanPackage = {
	name: pkg.name,
	version: pkg.version,
	description: pkg.description,
	main: pkg.main,
	license: pkg.license,
	homepage: pkg.homepage,
	keywords: pkg.keywords,
	private: pkg.private,
	publishConfig: pkg.publishConfig,
	author: pkg.author,
	repository: pkg.repository,
	files: pkg.files,
	n8n: pkg.n8n,
	peerDependencies: pkg.peerDependencies,
};

fs.writeFileSync(
	path.join(devPackageDir, 'package.json'),
	`${JSON.stringify(cleanPackage, null, 4)}\n`,
);
NODE

if [ -e "${DEV_PACKAGE_DIR}/dist" ] || [ -L "${DEV_PACKAGE_DIR}/dist" ]; then
	unlink "${DEV_PACKAGE_DIR}/dist" 2>/dev/null || true
fi
ln -s "${PROJECT_ROOT}/dist" "${DEV_PACKAGE_DIR}/dist"

if [ -L "${TARGET_LINK}" ]; then
	unlink "${TARGET_LINK}"
elif [ -e "${TARGET_LINK}" ]; then
	echo "Cannot replace ${TARGET_LINK} automatically because it is not a symlink." >&2
	echo "Remove it manually and run npm run dev:prepare again." >&2
	exit 1
fi

mkdir -p "$(dirname "${TARGET_LINK}")"
ln -s "${DEV_PACKAGE_DIR}" "${TARGET_LINK}"

echo "Prepared clean dev package at ${DEV_PACKAGE_DIR}"
echo "Linked ${TARGET_LINK} -> ${DEV_PACKAGE_DIR}"
