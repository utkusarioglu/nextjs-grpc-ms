#!/bin/bash

export NODE_EXTRA_CA_CERTS=/utkusarioglu-com/projects/nextjs-grpc/ms/.certs/grpc-server/tls.crt
yarn ts-node-dev  src/tracing.ts
