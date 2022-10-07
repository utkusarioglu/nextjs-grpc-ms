#!/bin/bash

docker build \
  -t utkusarioglu/ms-nextjsgprc-projects-utkusarioglu-com:tf \
  -f ms/.docker/Dockerfile.ci \
  .
