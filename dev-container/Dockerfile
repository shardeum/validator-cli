FROM alpine:3.19

ARG NODE_VERSION=18.16.1
ARG RUST_VERSION=1.74.1

ARG DASHBOARD_PATH=/var/shardeum/validator-dashboard
ARG ENTRYPOINT_PATH=$DASHBOARD_PATH/entrypoint.sh

ENV CLI_PATH=$DASHBOARD_PATH/cli
ENV GUI_PATH=$DASHBOARD_PATH/gui
ENV ENTRYPOINT_PATH=$ENTRYPOINT_PATH

# clone git repositories
ADD https://github.com/shardeum/validator-dashboard.git#dev $DASHBOARD_PATH
ADD https://github.com/shardeum/validator-cli.git#dev $CLI_PATH
ADD https://github.com/shardeum/validator-gui.git#dev $GUI_PATH

# install required packages
RUN apk add --no-cache \
alpine-sdk \
bash \
clang \
curl \
gcc \
git \
jq \
linux-headers \
logrotate \
make \
openssl-dev \
python3

SHELL ["/bin/bash", "-c"]

ENV HOME=/root
ENV NVM_DIR=$HOME/.nvm
ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$HOME/.cargo/bin:$PATH

# install nvm for installing Node.js
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

RUN <<EOF
# install and enable nodejs, then install node-gyp and shardus
source $NVM_DIR/nvm.sh \
&& nvm install $NODE_VERSION \
&& nvm use $NODE_VERSION \
&& nvm alias default $NODE_VERSION \
&& npm install -g pm2 node-gyp shardus
EOF

# set logrotate options
RUN <<EOF
echo "$HOME/.pm2/logs/*.log $CLI_PATH/build/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 user group
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}" | tee /etc/logrotate.d/pm2
EOF

# install cli
WORKDIR $CLI_PATH
RUN <<EOF
echo "installing cli"
npm i && npm link
EOF

# install gui
WORKDIR $GUI_PATH
RUN <<EOF
echo "installing gui"
npm i
npm run build
EOF

# create a volume that we can use to link the environment file
ENV CONF_PATH=/var/shardeum/conf
VOLUME $CONF_PATH
RUN ln -s $CONF_PATH/.env $DASHBOARD_PATH/.env

# expose the ports to the network
EXPOSE 9001 10001 8080

# copy the entrypoint script, make it executable, and set it as the entrypoint for this image
COPY ./entrypoint.sh $ENTRYPOINT_PATH
RUN chmod +x $ENTRYPOINT_PATH
WORKDIR $GUI_PATH
ENTRYPOINT $ENTRYPOINT_PATH
