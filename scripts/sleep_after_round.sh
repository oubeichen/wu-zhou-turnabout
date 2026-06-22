#!/usr/bin/env bash
set -euo pipefail

sleep_seconds="${ROUND_SLEEP_SECONDS:-1200}"

if [[ ! "$sleep_seconds" =~ ^[0-9]+$ ]]; then
  echo "ROUND_SLEEP_SECONDS must be a non-negative integer, got: $sleep_seconds" >&2
  exit 2
fi

if [[ "$sleep_seconds" == "0" ]]; then
  echo "Round sleep skipped because ROUND_SLEEP_SECONDS=0."
  exit 0
fi

minutes=$((sleep_seconds / 60))
seconds=$((sleep_seconds % 60))
printf 'Round complete. Sleeping for %d minute(s) %d second(s) before the next iteration...\n' "$minutes" "$seconds"
sleep "$sleep_seconds"
echo "Round sleep finished. It is safe to start the next iteration."
