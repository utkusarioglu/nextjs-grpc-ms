#!/bin/bash

export NODE_EXTRA_CA_CERTS=/utkusarioglu-com/projects/nextjs-grpc/ms/.certs/root/root.crt
node --experimental-fetch --inspect src/tracing.js
