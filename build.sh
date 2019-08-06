#!/bin/bash
set -o errexit -o pipefail -o noclobber -o nounset
! getopt --test > /dev/null 
if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
    echo 'I’m sorry, `getopt --test` failed in this environment.'
    exit 1
fi

OPTIONS=rlpvg
LONGOPTS=rbxmx,lua,verbose,lua-git #output:

LUA=""
RBXMX=""
PUBLISH=""

! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    exit 2
fi
# read getopt’s output this way to handle the quoting right:
eval set -- "$PARSED"

# now enjoy the options in order and nicely split until we see --
while true; do
    case "$1" in
        -p|--publish)
            PUBLISH=YES
            shift
            ;;
        -r|--rbxmx)
            RBXMX=YES
            shift
            ;;
        -l|--lua)
            LUA=YES
            shift
            ;;
        -v|--verbose)
            VERBOSE=YES
            shift
            ;;
        --)
            shift
            break
            ;;
        *)
            echo "Programming error"
            exit 3
            ;;
    esac
done

# GETOPTS END


# Remove existing dist
if [ -d "dist" ]; then
    rm -rf dist
fi

COMPILED=NO
function compile {
    if [[ $COMPILED == NO ]]; then
        echo "[net-build] compiling to bundle..."
        rbxtsc -r lua.project.json
        echo "[net-build] compiled."
        COMPILED=YES

        mkdir -p dist
    fi
}

function build_rbxmx {
    compile
    echo "[net-build] building rbxmx..."
    rojo build lua.project.json --output dist/net.rbxmx
    echo "[net-build] Output to ./dist/net.rbxmx"
}

function build_lua {
    compile
    echo "[net-build] compiling lua output..."
    rm -rf lualib
    mkdir -p lualib
    cp -r out/* lualib
    cp -r include lualib/vendor

    find lualib -name '*.d.ts' -delete
    rm -rf lualib/Test

    echo "[net-build] Output to ./lualib"
}

if ! [ -z "$RBXMX" ]; then
    build_rbxmx
fi

if ! [ -z "$LUA" ]; then
    build_lua
fi

if ! [ -z "$PUBLISH" ]; then
    rbxtsc
    npm version minor -m "Bump version"
    npm publish
fi