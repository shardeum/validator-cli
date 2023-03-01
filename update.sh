#!/bin/sh

check_update_available() {
  git fetch

  if git status | grep 'Your branch is up to date'; then
    echo "Already on the latest version."
    exit
  else
    echo "Found a new version, starting update..."
  fi
}

self_update() {
  git fetch
  git reset --hard HEAD
  git pull --force
  echo "Installing the new version..."
  npm install
  npm run compile
  npm link
  exit
}

dry_run() {
  echo 'Running update dry run'
  rm -rf tmp
  mkdir tmp
  cd tmp || exit
  git clone https://gitlab.com/shardeum/validator/cli.git
  cd cli || exit
  if npm install && npm run compile; then
    echo 'Dry run update successful'
    cd ../..
    rm -rf tmp
  else
    echo 'Compilation dry run failed! Canceling update process.'
    cd ../..
    rm -rf tmp
    exit 1
  fi
}

main() {
  echo '----- STARTING CLI UPDATE PROCESS -----'
  check_update_available
  dry_run
  self_update
}

main
