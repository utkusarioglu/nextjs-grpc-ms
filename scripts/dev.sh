#!/bin/bash

source scripts/ca-certificates.sh

NODE_ENV=development yarn ts-node-dev \
  -r tsconfig-paths/register \
  src/telemetry.ts
