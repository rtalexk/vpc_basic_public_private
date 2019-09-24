#!/bin/bash

cd /

PROJECT=backend

chmod 755 vpc_basic_public_private-master/build/shared.sh
./vpc_basic_public_private-master/build/shared.sh $PROJECT

cd /vpc_basic_public_private-master/$PROJECT

# Run project
npm start
