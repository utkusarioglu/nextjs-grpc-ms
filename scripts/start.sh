#!/bin/bash

export NODE_EXTRA_CA_CERTS=$CERTS_PATH/grpc-server/tls.crt
node --experimental-fetch dist/tracing.js
