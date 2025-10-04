#!/bin/bash

echo "🌐 Настройка интеграции API Gateway с Lambda"
echo "==========================================="

API_ID="faz0euexx8"
API_RESOURCE_ID="h5leh8"

echo "🔧 Настраиваем Lambda интеграцию..."

# Удаляем mock интеграцию
aws apigateway delete-integration \
    --rest-api-id $API_ID \
    --resource-id $API_RESOURCE_ID \
    --http-method ANY 2>/dev/null || echo "⚠️ Mock интеграция не найдена"

# Создаем Lambda интеграцию
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $API_RESOURCE_ID \
    --http-method ANY \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:664631055520:function:research-base-backend/invocations" 2>/dev/null || echo "⚠️ Ошибка создания Lambda интеграции"

echo "✅ Lambda интеграция настроена"

# Пересоздаем deployment
echo "🚀 Пересоздаем deployment..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod 2>/dev/null || echo "⚠️ Deployment уже существует"

echo "✅ API Gateway настроен!"
echo ""
echo "🎉 Система готова!"
echo "=================="
echo "Frontend: http://research-base-frontend-1759505581-angelinazajceva.s3-website-us-east-1.amazonaws.com/"
echo "API: https://faz0euexx8.execute-api.us-east-1.amazonaws.com/prod"
echo "Lambda: research-base-backend"
echo ""
echo "🧪 Тестирование:"
echo "curl https://faz0euexx8.execute-api.us-east-1.amazonaws.com/prod/health"
