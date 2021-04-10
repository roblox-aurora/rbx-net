#!/bin/bash
# ===============================================
# TypeScript to Luau generator script for CI
# by Jonathan Holmes (Vorlias)
# 2021
# ===============================================

# Ensure node_modules
if [[ ! -f "node_modules" ]]; then
    npm install
fi

# Requires a build:luau script. :-)
npm run build:luau

pushd $(dirname $0)

rm -rf out
mkdir -p out/dist

# Copy across roblox-ts runtime libraries
mkdir -p out/dist/TS
cp -r ../include/* out/dist/TS

# Copy dependencies if we end up with any...
readarray -t dependencies < <(cat ../package.json | jq -r '.dependencies | [ keys [] ]' | jq -c -r '.[]')
for dependency in "${dependencies[@]}"; do
    if [[ $dependency =~ "@rbxts/" ]]; then
        mkdir -p out/dist/TS/node_modules/$dependency
        cp -r ../node_modules/$dependency out/dist/TS/node_modules/$dependency
    fi
done

cp -r ../out/* out/dist

echo "Removing declaration files"
find out/dist -name '*.d.ts' -delete

# Copy dist
echo "Copy dist include"
cp -r dist/* out

# Copy README.md + logo
cp ../README.md out
cp ../logo.png out

popd