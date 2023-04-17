#!/bin/bash

export NODE_EXTRA_CA_CERTS="$CERTS_ABSPATH/grpc-server/tls.crt"
NODE_ENV=development yarn ts-node-dev  src/no-telemetry.ts
