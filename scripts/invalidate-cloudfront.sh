#!/bin/bash

# CloudFront Cache Invalidation Script
# Usage: ./scripts/invalidate-cloudfront.sh

DISTRIBUTION_ID="E2ULUJ327LYQX0"

echo "Creating CloudFront cache invalidation..."
echo "Distribution ID: $DISTRIBUTION_ID"

# Create invalidation for all files
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.{Id:Id,Status:Status,CreateTime:CreateTime}' \
  --output table

echo ""
echo "Cache invalidation created successfully!"
echo "It may take 10-15 minutes for the invalidation to complete."
