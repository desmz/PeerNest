#!/bin/bash

SEED_DIR="src/seeds"
FILENAME=$1

if [ -z "$FILENAME" ]; then
  echo "Please provide a seed filename"
  exit 1
fi

FILE_PATH="$SEED_DIR/$FILENAME"

if [ ! -f "$FILE_PATH" ]; then
  echo "File $FILE_PATH does not exist!"
  exit 1
fi

pnpx tsx "$FILE_PATH"
