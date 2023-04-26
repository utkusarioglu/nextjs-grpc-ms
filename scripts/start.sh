#!/bin/bash

grpc_server_cert_abspath="$CERTIFICATES_ABSPATH/$GRPC_SERVER_CERT_SUBPATH"

export NODE_EXTRA_CA_CERTS="$grpc_server_cert_abspath/tls.crt"

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
