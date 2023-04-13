#!/bin/bash

export NODE_EXTRA_CA_CERTS=$CERTS_PATH/.certs/grpc-server/tls.crt
node --experimental-fetch dist/tracing.js
