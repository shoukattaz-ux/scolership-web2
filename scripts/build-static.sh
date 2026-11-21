#!/usr/bin/env bash
# Builds a fully static copy of the public site into ./dist for Cloudflare Pages.
# Uses the PUBLISHED content in your local database (data/scholarpath.db).
# Admin, login and the contact-form API are not part of the static build.
set -euo pipefail
cd "$(dirname "$0")/.."
export ADMIN_EMAIL="${ADMIN_EMAIL:-build@localhost.invalid}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(head -c 18 /dev/urandom | base64 | tr -d '/+=')}"
node_modules/.bin/tsx server.ts > /tmp/static-export.log 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
for i in $(seq 1 40); do curl -fsS localhost:3000/api/bootstrap -o public/site-data.json 2>/dev/null && break; sleep 0.5; done
test -s public/site-data.json || { echo "Could not export site data"; exit 1; }
kill $SRV; trap - EXIT
VITE_STATIC=1 node_modules/.bin/vite build
echo "Static site ready in ./dist (upload to Cloudflare Pages)"
