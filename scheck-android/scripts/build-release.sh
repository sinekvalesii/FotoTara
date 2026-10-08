#!/usr/bin/env bash
# Kullanım: SCHECK_KS_STOREFILE=... SCHECK_KS_STOREPASSWORD=... SCHECK_KS_KEYALIAS=... SCHECK_KS_KEYPASSWORD=... VERSION_CODE=10 ./scripts/build-release.sh
set -euo pipefail
cd "$(dirname "$0")/.."
./gradlew clean :app:bundleRelease
echo "AAB: app/build/outputs/bundle/release/app-release.aab"
