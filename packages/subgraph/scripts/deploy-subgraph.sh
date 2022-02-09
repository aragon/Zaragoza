#!/usr/bin/env bash

if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
else
  echo 'no .env found'
  exit -1
fi

if [ -z "$NETWORK_NAME" ] || [ -z "$THEGRAPH_USERNAME" ] || [ -z "$SUBGRAPH_NAME" ] || [ -z "$GRAPH_KEY" ]
then
    echo "env variables are not set properly, exiting..."
    exit -1
fi

# Exit script as soon as a command fails.
set -o errexit

# Build manifest
echo ''
echo '> Building manifest file subgraph.yaml'
./scripts/build-manifest.sh

# Generate types
echo ''
echo '> Generating types'
graph codegen

if [ "$NETWORK_NAME" == 'localhost' ]
then
  NETWORK_NAME='rinkeby'
fi

# Prepare subgraph name
FULLNAME=$THEGRAPH_USERNAME/aragon-$SUBGRAPH_NAME-$NETWORK_NAME
if [ "$STAGING" ]; then
  FULLNAME=$FULLNAME-staging
fi
echo ''
echo '> Deploying subgraph: '$FULLNAME

# Deploy subgraph
if [ "$LOCAL" ]
then
    graph deploy $FULLNAME \
        --ipfs http://localhost:5001 \
        --node http://localhost:8020
else
    graph deploy $FULLNAME \
        --ipfs https://api.thegraph.com/ipfs/ \
        --node https://api.thegraph.com/deploy/ \
        --access-token $GRAPH_KEY > deploy-output.txt

    SUBGRAPH_ID=$(grep "Build completed:" deploy-output.txt | grep -oE "Qm[a-zA-Z0-9]{44}")
    rm deploy-output.txt
    echo "The Graph deployment complete: ${SUBGRAPH_ID}"

fi
