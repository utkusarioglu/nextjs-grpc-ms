#!/bin/bash

source scripts/ca-certificates.sh

if [ "$FEATURE_INSTRUMENTATION" == "false" ]; then
  echo "Disabling instrumentation because \$FEATURE_INSTRUMENTATION=$FEATURE_INSTRUMENTATION"
  NODE_ENV=production node \
    -r ./tsconfig-paths.js \
    dist/no-telemetry.js
else 
  NODE_ENV=production node \
    -r ./tsconfig-paths.js \
    dist/telemetry.js
fi
