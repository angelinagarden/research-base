# ✅ AWS Deployment Checklist - Research Base

## 🎯 Complete AWS Setup Guide

### Phase 1: Core Infrastructure ✅

- [x] **S3 Bucket for Frontend**
  - Bucket: `research-base-frontend-{timestamp}-angelinazajceva`
  - Static website hosting enabled
  - Public access configured
  - CORS policy set

- [x] **S3 Bucket for PDFs**
  - Bucket: `research-base-angelina`
  - CORS policy configured
  - Event notifications ready

- [x] **IAM User & Policies**
  - User: `angelina`
  - Policy: `ResearchBaseLambdaPolicy`
  - AWS CLI configured

### Phase 2: Lambda Functions 🔄

- [ ] **PDF Processor Lambda**
  - Function: `research-base-pdf-processor`
  - Runtime: Node.js 18.x
  - Role: `research-base-lambda-role`
  - Environment: `OPENAI_API_KEY`
  - Code: [aws-lambda-pdf-processor.js]

- [ ] **API Handler Lambda**
  - Function: `research-base-api-handler`
  - Runtime: Node.js 18.x
  - Role: `research-base-lambda-role`
  - Environment: `S3_BUCKET`, `AWS_REGION`
  - Code: [aws-lambda-api.js]

### Phase 3: API Gateway 🔄

- [ ] **Create API**
  - Name: `research-base-api`
  - Description: API for Research Base application

- [ ] **Create Resources**
  - `POST /upload` → Lambda API Handler
  - `POST /process/{fileId}` → Lambda API Handler
  - `GET /status/{fileId}` → Lambda API Handler

- [ ] **Configure CORS**
  - Enable CORS on all methods
  - Allow origins: Frontend domain

- [ ] **Deploy API**
  - Stage: `prod`
  - Note the Invoke URL

### Phase 4: S3 Triggers 🔄

- [ ] **Configure Event Notification**
  - Bucket: `research-base-angelina`
  - Prefix: `uploads/`
  - Suffix: `.pdf`
  - Destination: `research-base-pdf-processor` Lambda

### Phase 5: Frontend Configuration 🔄

- [ ] **Update API Configuration**
  - File: `src/config/api.ts`
  - Replace `your-api-gateway-url` with actual URL
  - Update endpoints to match API Gateway

- [ ] **Redeploy Frontend**
  ```bash
  npm run build:prod
  aws s3 sync dist/ s3://research-base-frontend-{timestamp}-angelinazajceva --delete
  ```

### Phase 6: Testing 🔄

- [ ] **Test Upload Flow**
  1. Upload PDF through frontend
  2. Check S3 bucket for file
  3. Verify Lambda trigger execution
  4. Check CloudWatch logs

- [ ] **Test Processing Flow**
  1. Wait for processing completion
  2. Check `processed/` folder in S3
  3. Verify AI extraction results
  4. Test status API endpoint

- [ ] **Test API Endpoints**
  ```bash
  # Test upload
  curl -X POST https://your-api-gateway-url.amazonaws.com/prod/upload
  
  # Test status
  curl https://your-api-gateway-url.amazonaws.com/prod/status/{fileId}
  ```

### Phase 7: Monitoring & Optimization 🔄

- [ ] **CloudWatch Logs**
  - Check Lambda execution logs
  - Monitor error rates
  - Set up log retention

- [ ] **Performance Monitoring**
  - Monitor Lambda duration
  - Track API Gateway latency
  - Monitor S3 request patterns

- [ ] **Cost Monitoring**
  - Set up billing alerts
  - Monitor monthly costs
  - Optimize Lambda memory/timeout

## 🚨 Critical Configuration Points

### 1. **API Gateway URL**
After creating API Gateway, update:
```
src/config/api.ts:7
https://your-api-gateway-url.amazonaws.com/prod
```

### 2. **Lambda Environment Variables**
- PDF Processor: `OPENAI_API_KEY`
- API Handler: `S3_BUCKET=research-base-angelina`

### 3. **S3 Event Notification**
- Source bucket: `research-base-angelina`
- Event types: `s3:ObjectCreated:*`
- Filter: `uploads/` prefix, `.pdf` suffix

### 4. **CORS Configuration**
- API Gateway: Allow frontend domain
- S3: Allow API Gateway requests

## 🔧 Troubleshooting Commands

```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `research-base`)].FunctionName'

# Check S3 bucket events
aws s3api get-bucket-notification-configuration --bucket research-base-angelina

# Test Lambda function
aws lambda invoke --function-name research-base-pdf-processor --payload '{}' response.json

# Check API Gateway
aws apigateway get-rest-apis --query 'items[?name==`research-base-api`]'
```

## 📋 Final Verification

- [ ] Frontend loads correctly
- [ ] PDF upload works
- [ ] Processing completes successfully
- [ ] AI extraction returns structured data
- [ ] Status API responds correctly
- [ ] All CloudWatch logs show no errors

## 🎉 Success Criteria

✅ **Complete serverless architecture**  
✅ **Automatic PDF processing**  
✅ **AI-powered text extraction**  
✅ **Scalable and cost-effective**  
✅ **Easy to maintain and debug**  

## 📞 Support

If any step fails:
1. Check CloudWatch logs
2. Verify IAM permissions
3. Test individual components
4. Check AWS service status

**Total estimated deployment time: 2-3 hours**  
**Monthly operational cost: ~$2-5**
