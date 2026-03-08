#!/bin/sh
set -e
# Generate self-signed cert if not provided (e.g. on EC2)
if ! [ -f /etc/nginx/ssl/cert.pem ]; then
  echo "No SSL cert found; generating self-signed certificate..."
  mkdir -p /etc/nginx/ssl
  openssl req -x509 -nodes -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
    -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem
  echo "Self-signed certificate created."
fi
exec nginx -g "daemon off;"
