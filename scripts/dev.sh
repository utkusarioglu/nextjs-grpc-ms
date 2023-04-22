#!/bin/bash

grpc_server_cert_abspath="$CERTS_ABSPATH/$GRPC_SERVER_CERT_SUBPATH"

export NODE_EXTRA_CA_CERTS="$grpc_server_cert_abspath/tls.crt"

NODE_ENV=development yarn ts-node-dev \
  -r tsconfig-paths/register \
  src/telemetry.ts
