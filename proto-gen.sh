#!/usr/bin/env bash

mkdir -p ./generated/services/user
mkdir -p ./generated/services/session

### user
yarn pbjs \
  --target static-module \
  --no-encode \
  --no-decode \
  --path ../../ \
  --out generated/services/user/index.js \
  ./services/user-service/server/pb/UserService.proto

yarn pbts \
  --out ./generated/services/user/index.d.ts \
  ./generated/services/user/index.js

### https://github.com/protobufjs/protobuf.js/issues/1222
sed -i -e "s/\[ 'Promise' \]\./Promise/g" "generated/services/user/index.d.ts"
sed -i -e "s/\[ 'object' \]\.<string, any>/{ [k: string]: any }/g" "generated/services/user/index.d.ts"
sed -i -e "s/\[ 'Array' \]\./Array/g" "generated/services/user/index.d.ts"
###

### session
yarn pbjs \
  --target static-module \
  --no-encode \
  --no-decode \
  --path ../../ \
  --out generated/services/session/index.js \
  ./services/session-service/protos/SessionService.proto

yarn pbts \
  --out ./generated/services/session/index.d.ts \
  ./generated/services/session/index.js

### https://github.com/protobufjs/protobuf.js/issues/1222
sed -i -e "s/\[ 'Promise' \]\./Promise/g" "generated/services/session/index.d.ts"
sed -i -e "s/\[ 'object' \]\.<string, any>/{ [k: string]: any }/g" "generated/services/session/index.d.ts"
sed -i -e "s/\[ 'Array' \]\./Array/g" "generated/services/session/index.d.ts"
###