#!/bin/bash

# GETOPTS START
# saner programming env: these switches turn some bugs into errors
set -o errexit -o pipefail -o noclobber -o nounset

# -allow a command to fail with !’s side effect on errexit
# -use return value from ${PIPESTATUS[0]}, because ! hosed $?
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

# -regarding ! and PIPESTATUS see above
# -temporarily store output to be able to check for errors
# -activate quoting/enhanced mode (e.g. by writing out “--options”)
# -pass arguments only via   -- "$@"   to separate them correctly
! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # e.g. return value is 1
    #  then getopt has complained about wrong arguments to stdout
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
        -g|--lua-git)
            TOGIT=YES
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
    mkdir -p dist/lua
    cp -r out/* dist/lua
    cp -r include dist/lua/vendor
    echo "[net-build] Output to ./dist/lua"
}

function lua_to_git {
    git checkout lua
    git checkout master -- dist
    git add utils
    git commit -m "Adding dist from master"

    git checkout master
}

if ! [ -z "$RBXMX" ]; then
    build_rbxmx
fi

if ! [ -z "$LUA" ]; then
    build_lua
fi

if ! [ -z "$TOGIT" ]; then
    lua_to_git
fi

if ! [ -z "$PUBLISH" ]; then
    rbxtsc
    npm version minor -m "Bump version"
    npm publish
fi