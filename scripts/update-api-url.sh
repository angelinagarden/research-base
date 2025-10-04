#!/bin/bash

# Update API Gateway URL in frontend configuration
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <API_GATEWAY_URL>"
    echo "Example: $0 https://abc123def4.execute-api.us-east-1.amazonaws.com/prod"
    exit 1
fi

API_URL="$1"

echo "🔧 Updating API URL to: $API_URL"

# Update the API configuration file
sed -i.bak "s|https://your-api-gateway-url.amazonaws.com/prod|$API_URL|g" src/config/api.ts

echo "✅ API URL updated in src/config/api.ts"

# Build and deploy frontend
echo "🏗️ Building frontend..."
npm run build:prod

echo "📤 Deploying to S3..."
aws s3 sync dist/ s3://research-base-frontend-1759505581-angelinazajceva --delete

echo "🎉 Frontend updated and deployed!"
echo "🌐 Access your app at: http://research-base-frontend-1759505581-angelinazajceva.s3-website-us-east-1.amazonaws.com"
