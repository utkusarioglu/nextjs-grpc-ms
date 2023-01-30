#!/bin/bash

yarn dev &
/bin/sh -c "while sleep 1000; do :; done"
