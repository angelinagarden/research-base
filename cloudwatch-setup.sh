#!/bin/bash

# Создание CloudWatch метрик и алармов для мониторинга системы

echo "Setting up CloudWatch monitoring for research processing system..."

# 1. Создаем кастомные метрики
aws cloudwatch put-metric-data \
  --namespace "Research/Processing" \
  --metric-data MetricName=FilesProcessed,Value=0,Unit=Count \
  --region us-east-1

aws cloudwatch put-metric-data \
  --namespace "Research/Processing" \
  --metric-data MetricName=ProcessingErrors,Value=0,Unit=Count \
  --region us-east-1

aws cloudwatch put-metric-data \
  --namespace "Research/Processing" \
  --metric-data MetricName=ProcessingTime,Value=0,Unit=Seconds \
  --region us-east-1

# 2. Создаем аларм для ошибок Lambda
aws cloudwatch put-metric-alarm \
  --alarm-name "research-lambda-errors" \
  --alarm-description "Alarm when Lambda function has errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=FunctionName,Value=research-base-api-handler \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:664631055520:research-processing-notifications \
  --region us-east-1

# 3. Создаем аларм для ошибок S3 триггера
aws cloudwatch put-metric-alarm \
  --alarm-name "research-s3-trigger-errors" \
  --alarm-description "Alarm when S3 trigger Lambda has errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=FunctionName,Value=research-s3-trigger \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:664631055520:research-processing-notifications \
  --region us-east-1

# 4. Создаем аларм для длительности выполнения
aws cloudwatch put-metric-alarm \
  --alarm-name "research-lambda-duration" \
  --alarm-description "Alarm when Lambda execution takes too long" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 30000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=research-base-api-handler \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:664631055520:research-processing-notifications \
  --region us-east-1

# 5. Создаем аларм для DynamoDB ошибок
aws cloudwatch put-metric-alarm \
  --alarm-name "research-dynamodb-errors" \
  --alarm-description "Alarm when DynamoDB has errors" \
  --metric-name UserErrors \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=TableName,Value=research-extracted-text \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:664631055520:research-processing-notifications \
  --region us-east-1

# 6. Создаем аларм для Textract ошибок
aws cloudwatch put-metric-alarm \
  --alarm-name "research-textract-errors" \
  --alarm-description "Alarm when Textract has errors" \
  --metric-name UserErrors \
  --namespace AWS/Textract \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:664631055520:research-processing-notifications \
  --region us-east-1

echo "CloudWatch monitoring setup completed!"
echo ""
echo "Created alarms:"
echo "- research-lambda-errors: Lambda function errors"
echo "- research-s3-trigger-errors: S3 trigger errors" 
echo "- research-lambda-duration: Lambda execution time"
echo "- research-dynamodb-errors: DynamoDB errors"
echo "- research-textract-errors: Textract errors"
echo ""
echo "All alarms are configured to send notifications to SNS topic:"
echo "arn:aws:sns:us-east-1:664631055520:research-processing-notifications"
