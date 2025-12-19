#!/bin/bash

# Script to start ngrok tunnel for local development
# This will expose your local React app (port 3000) to the internet

PORT=${1:-3000}

echo "Starting ngrok tunnel on port $PORT..."
echo "Your local app will be accessible via the ngrok URL shown below"
echo ""
echo "To access on your phone, use the HTTPS URL (not localhost)"
echo ""

ngrok http $PORT

