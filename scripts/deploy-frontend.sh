#!/bin/bash

# Deploy Frontend to AWS S3 + CloudFront
echo "🚀 Deploying Research Base Frontend to AWS"
echo "==========================================="

# Configuration
FRONTEND_BUCKET="research-base-frontend-$(date +%s)-$(whoami)"
CLOUDFRONT_DISTRIBUTION="research-base-cdn"
REGION="us-east-1"

echo "📋 Configuration:"
echo "- Frontend Bucket: $FRONTEND_BUCKET"
echo "- Region: $REGION"
echo "- CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run ./scripts/setup-aws.sh first"
    exit 1
fi

echo "✅ AWS CLI configured"

# Build the frontend
echo ""
echo "🔨 Building frontend..."
cd /Users/angelinazajceva/research-base

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Build for production
echo "🏗️ Building for production..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed. No dist directory found."
    exit 1
fi

echo "✅ Frontend built successfully"

# Create S3 bucket for frontend
echo ""
echo "🪣 Creating S3 bucket for frontend..."
aws s3 mb s3://$FRONTEND_BUCKET --region $REGION

if [ $? -ne 0 ]; then
    echo "❌ Failed to create S3 bucket"
    exit 1
fi

echo "✅ S3 bucket created: $FRONTEND_BUCKET"

# Configure bucket for static website hosting
echo ""
echo "🌐 Configuring S3 for static website hosting..."
aws s3 website s3://$FRONTEND_BUCKET --index-document index.html --error-document index.html

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public access..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$FRONTEND_BUCKET/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $FRONTEND_BUCKET --policy file://bucket-policy.json
rm bucket-policy.json

echo "✅ Bucket configured for public access"

# Upload files to S3
echo ""
echo "📤 Uploading files to S3..."
aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete

if [ $? -ne 0 ]; then
    echo "❌ Failed to upload files to S3"
    exit 1
fi

echo "✅ Files uploaded to S3"

# Get website URL
WEBSITE_URL="http://$FRONTEND_BUCKET.s3-website-$REGION.amazonaws.com"
echo ""
echo "🌐 Frontend deployed successfully!"
echo ""
echo "📋 Deployment Details:"
echo "- S3 Bucket: $FRONTEND_BUCKET"
echo "- Website URL: $WEBSITE_URL"
echo "- Region: $REGION"
echo ""
echo "🔗 Access your application at:"
echo "   $WEBSITE_URL"
echo ""

# Ask if user wants to set up CloudFront
echo "🚀 Next steps:"
echo "1. Test your application at: $WEBSITE_URL"
echo "2. Set up CloudFront CDN for better performance"
echo "3. Configure custom domain (optional)"
echo ""
echo "Would you like to set up CloudFront CDN now? (y/n)"
read -r setup_cloudfront

if [ "$setup_cloudfront" = "y" ] || [ "$setup_cloudfront" = "Y" ]; then
    echo ""
    echo "☁️ Setting up CloudFront distribution..."
    
    # Create CloudFront distribution
    cat > cloudfront-config.json << EOF
{
    "CallerReference": "research-base-$(date +%s)",
    "Comment": "Research Base Frontend CDN",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$FRONTEND_BUCKET",
                "DomainName": "$FRONTEND_BUCKET.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$FRONTEND_BUCKET",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

    # Create CloudFront distribution
    DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --query 'Distribution.Id' --output text)
    
    if [ $? -eq 0 ]; then
        echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"
        
        # Get CloudFront URL
        CLOUDFRONT_URL=$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
        
        echo ""
        echo "🌐 CloudFront CDN Details:"
        echo "- Distribution ID: $DISTRIBUTION_ID"
        echo "- CloudFront URL: https://$CLOUDFRONT_URL"
        echo ""
        echo "⏳ Note: CloudFront distribution takes 15-20 minutes to deploy globally"
        echo "You can check the status at: https://console.aws.amazon.com/cloudfront/"
        echo ""
        echo "🔗 Once deployed, your app will be available at:"
        echo "   https://$CLOUDFRONT_URL"
    else
        echo "❌ Failed to create CloudFront distribution"
    fi
    
    rm cloudfront-config.json
fi

echo ""
echo "🎉 Frontend deployment completed!"
echo ""
echo "📝 Save these details for later:"
echo "- S3 Bucket: $FRONTEND_BUCKET"
echo "- Website URL: $WEBSITE_URL"
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo "- CloudFront Distribution ID: $DISTRIBUTION_ID"
    echo "- CloudFront URL: https://$CLOUDFRONT_URL"
fi
echo ""
echo "💡 To update your deployment in the future:"
echo "1. Run: npm run build"
echo "2. Run: aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete"

