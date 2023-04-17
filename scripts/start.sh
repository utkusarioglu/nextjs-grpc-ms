#!/bin/bash

export NODE_EXTRA_CA_CERTS=$CERTS_ABSPATH/grpc-server/tls.crt
if [ "$ENABLE_INSTRUMENTATION" == "FALSE" ]; then
  echo "Disabling instrumentation because \$ENABLE_INSTRUMENTATION=$ENABLE_INSTRUMENTATION"
  NODE_ENV=production node --experimental-fetch dist/no-telemetry.js
else 
  NODE_ENV=production node --experimental-fetch dist/telemetry.js
fi
