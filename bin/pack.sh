#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$DIR")"

SRC_DIR="$ROOT_DIR/src"
TIMESTAMP="$(date +%Y_%m_%d)"

pushd "$SRC_DIR"
	zip -r "$ROOT_DIR/build_$TIMESTAMP.zip" "."
popd
