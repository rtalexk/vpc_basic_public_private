#!/bin/bash

PROJECT=$1

cd /

yum update -y

# Install Nginx
amazon-linux-extras install nginx1.12 -y

# Configure Nginx Proxy
mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
cp vpc_basic_public_private-master/build/nginx_$PROJECT.conf /etc/nginx/nginx.conf
service nginx restart

# Start Nginx on server restart
chkconfig nginx on

# install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

. ~/.nvm/nvm.sh
nvm install 10

# Install code
cd vpc_basic_public_private-master/$PROJECT
npm install

# Run project
if [$PROJECT = frontend]
then
    npm run build
fi

npm start
