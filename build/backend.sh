#!/bin/bash

cd /

PROJECT=backend

# Download code
wget https://github.com/rtalexk/vpc_basic_public_private/archive/master.zip
unzip master.zip
rm -f master.zip

# Setup libraries and project
chmod 755 vpc_basic_public_private-master/build/shared.sh
./vpc_basic_public_private-master/build/shared.sh $PROJECT
