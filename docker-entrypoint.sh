#!/bin/sh

# This script is used in the docker container to dynamically
# configure an application's API endpoint. It does the following:
# 1. Replaces the API_URL in a config file.
# 2. Starts the Nginx server.

# Replace API_URL in config.js
sed -i "s|API_URL:.*|API_URL: '${API_URL}'|" /usr/share/nginx/html/js/config/config.js

# Start nginx
nginx -g 'daemon off;'