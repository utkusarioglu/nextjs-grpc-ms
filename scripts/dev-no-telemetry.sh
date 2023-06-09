#!/bin/bash

source scripts/ca-certificates.sh

NODE_ENV=development yarn ts-node-dev \
  --watch ./config \
  -r tsconfig-paths/register \
  src/no-telemetry.ts
