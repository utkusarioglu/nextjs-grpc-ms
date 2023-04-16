#!/bin/bash

export NODE_EXTRA_CA_CERTS=$CERTS_PATH/grpc-server/tls.crt
yarn ts-node-dev  src/no-telemetry.ts
