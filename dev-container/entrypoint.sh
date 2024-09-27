#!/usr/bin/env bash

set -o allexport
source $CONF_PATH/.env
set +o allexport

# if CA.cnf does not exist, create it
if [ ! -f "CA.cnf" ]; then
    echo "[ req ]
prompt = no
distinguished_name = req_distinguished_name

[ req_distinguished_name ]
C = XX
ST = Localzone
L = localhost
O = Certificate Authority Local Validator Node
OU = Develop
CN = mynode-sphinx.sharedum.local
emailAddress = community@.sharedum.local" > CA.cnf
fi

# if CA.key does not exist, create it
if [ ! -f "CA_key.pem" ]; then
    openssl req -nodes -new -x509 -keyout CA_key.pem -out CA_cert.pem -days 1825 -config CA.cnf
fi

# if selfsigned.cnf does not exist, create it
if [ ! -f "selfsigned.cnf" ]; then
    echo "[ req ]
default_bits  = 4096
distinguished_name = req_distinguished_name
req_extensions = req_ext
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
countryName = XX
stateOrProvinceName = Localzone
localityName = Localhost
organizationName = Shardeum Sphinx 1.x Validator Cert.
commonName = localhost

[req_ext]
subjectAltName = @alt_names

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = $SERVERIP
IP.2 = $LOCALLANIP
DNS.1 = localhost" > selfsigned.cnf
fi

# if csr file does not exist, create it
if [ ! -f "selfsigned.csr" ]; then
    openssl req -sha256 -nodes -newkey rsa:4096 -keyout selfsigned.key -out selfsigned.csr -config selfsigned.cnf
fi

# if selfsigned.crt does not exist, create it
if [ ! -f "selfsigned_node.crt" ]; then
    openssl x509 -req -days 398 -in selfsigned.csr -CA CA_cert.pem -CAkey CA_key.pem -CAcreateserial -out selfsigned_node.crt -extensions req_ext -extfile selfsigned.cnf
fi
# if selfsigned.crt does not exist, create it
if [ ! -f "selfsigned.crt" ]; then
  cat selfsigned_node.crt CA_cert.pem > selfsigned.crt
fi
cd ../..

# Start GUI if configured to in env file
echo $RUNDASHBOARD
if [ "$RUNDASHBOARD" == "y" ]
then
echo "Starting operator gui"
# Call the CLI command to set the GUI password
operator-cli gui set password -h "$DASHPASS"
# Call the CLI command to set the GUI port
operator-cli gui set port $DASHPORT
# Call the CLI command to start the GUI
operator-cli gui start
fi

echo "done";

# Keep container running
tail -f /dev/null
