# 🏗️ AWS Architecture - Research Base

## 📋 Overview

Research Base использует полностью serverless архитектуру на AWS для обработки PDF файлов с AI анализом.

## 🏛️ Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   S3 Bucket     │    │   Lambda        │
│   (S3 + CF)     │───▶│   research-     │───▶│   PDF Processor │
│                 │    │   base-angelina │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   S3 Trigger    │    │   OpenAI API    │
         │              │   (uploads/)    │    │   GPT-4         │
         │              └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │
│   research-     │
│   base-api      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Lambda API    │
│   Handler       │
└─────────────────┘
```

## 🔧 AWS Services Used

### 1. **S3 Buckets**
- **research-base-frontend-{timestamp}-angelinazajceva**: Frontend hosting
- **research-base-angelina**: PDF storage and processing

### 2. **Lambda Functions**
- **research-base-pdf-processor**: Обработка PDF файлов
- **research-base-api-handler**: API endpoints для frontend

### 3. **API Gateway**
- **research-base-api**: REST API для frontend

### 4. **IAM Roles & Policies**
- **research-base-lambda-role**: Lambda execution role
- **ResearchBaseLambdaPolicy**: Custom policy для Lambda

## 📁 S3 Bucket Structure

```
research-base-angelina/
├── uploads/                    # Загруженные PDF файлы
│   └── research-{id}.pdf
├── processed/                  # Результаты AI обработки
│   └── research-{id}-result.json
└── frontend/                   # Статический frontend (если нужно)
```

## 🔄 Workflow Process

### 1. **File Upload Flow**
```
User → Frontend → API Gateway → Lambda API → S3 Pre-signed URL → User uploads to S3
```

### 2. **Processing Flow**
```
S3 Upload → S3 Trigger → Lambda PDF Processor → OpenAI API → Save Results → S3
```

### 3. **Status Check Flow**
```
Frontend → API Gateway → Lambda API → Check S3 for results → Return status
```

## ⚙️ Configuration

### Environment Variables

#### Lambda PDF Processor
```
OPENAI_API_KEY=sk-proj-...
```

#### Lambda API Handler
```
AWS_REGION=us-east-1
S3_BUCKET=research-base-angelina
```

### IAM Permissions

#### research-base-lambda-role
- `AmazonS3FullAccess`
- `AmazonTextractFullAccess`
- `CloudWatchLogsFullAccess`

## 🚀 Deployment Steps

### 1. **Frontend Deployment**
```bash
npm run build:prod
aws s3 sync dist/ s3://research-base-frontend-{timestamp}-angelinazajceva --delete
```

### 2. **Lambda Functions**
- Deploy through AWS Console or AWS CLI
- Set environment variables
- Configure IAM roles

### 3. **API Gateway**
- Create API
- Configure resources and methods
- Deploy to stage

## 📊 Monitoring & Logs

### CloudWatch Logs
- `/aws/lambda/research-base-pdf-processor`
- `/aws/lambda/research-base-api-handler`

### S3 Metrics
- Bucket size and request metrics
- Error rates and latency

## 🔒 Security

### CORS Configuration
- API Gateway: Allowed origins from frontend
- S3: Public read for frontend, restricted write

### IAM Policies
- Least privilege principle
- Resource-specific permissions

## 💰 Cost Estimation

### Monthly Costs (estimated)
- **S3 Storage**: ~$0.02 (10MB storage)
- **Lambda**: ~$0.10 (1000 requests)
- **API Gateway**: ~$0.35 (1M requests)
- **Textract**: ~$1.50 (100 pages)
- **CloudFront**: ~$0.10 (10GB transfer)

**Total: ~$2.00/month**

## 🔧 Troubleshooting

### Common Issues

1. **Lambda timeout**
   - Increase timeout to 5 minutes
   - Check OpenAI API response time

2. **S3 permissions**
   - Verify bucket policy
   - Check IAM role permissions

3. **API Gateway CORS**
   - Enable CORS on all methods
   - Check preflight OPTIONS requests

### Debug Commands
```bash
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/research-base

# Check S3 bucket contents
aws s3 ls s3://research-base-angelina --recursive

# Test API Gateway
curl -X POST https://your-api-gateway-url.amazonaws.com/prod/upload
```

## 📝 Next Steps

1. **Notion Integration**: Add Lambda function for Notion API
2. **Google Drive**: Add Lambda function for Google Drive API
3. **Database**: Add DynamoDB for metadata storage
4. **Monitoring**: Set up CloudWatch alarms
5. **CI/CD**: Automate deployments with GitHub Actions

## 🔗 Useful Links

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
