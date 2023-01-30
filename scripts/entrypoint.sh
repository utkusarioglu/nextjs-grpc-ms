#!/bin/bash

start_app() {
  if [ "$RUN_MODE" == "development" ]; then
    echo "Starting in development mode…"
    yarn dev & /bin/sh -c "while sleep 1000; do :; done"
  else
    echo "Starting in production mode…"
    yarn start
  fi
}

start_app 
