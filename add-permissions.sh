#!/bin/bash

echo "🔐 Добавление прав для автоматического развертывания"
echo "=================================================="

# Проверяем, есть ли права IAM
if ! aws iam get-user > /dev/null 2>&1; then
    echo "❌ Нет прав IAM. Нужно добавить права через AWS Console."
    echo ""
    echo "📋 Инструкции:"
    echo "1. Откройте AWS Console → IAM"
    echo "2. Перейдите в Users → angelina"
    echo "3. Нажмите Add permissions → Attach policies directly"
    echo "4. Создайте новую политику с содержимым из deployment-policy.json"
    echo "5. Прикрепите к пользователю"
    echo ""
    echo "📁 Файл с политикой: deployment-policy.json"
    exit 1
fi

echo "✅ Есть права IAM, создаем политику..."

# Создаем политику
POLICY_ARN=$(aws iam create-policy \
    --policy-name ResearchBaseDeploymentPolicy \
    --policy-document file://deployment-policy.json \
    --query 'Policy.Arn' \
    --output text 2>/dev/null || echo "")

if [ -z "$POLICY_ARN" ]; then
    echo "⚠️ Политика уже существует, получаем ARN..."
    POLICY_ARN=$(aws iam list-policies \
        --query 'Policies[?PolicyName==`ResearchBaseDeploymentPolicy`].Arn' \
        --output text)
fi

if [ -n "$POLICY_ARN" ]; then
    echo "✅ Политика создана/найдена: $POLICY_ARN"
    
    # Прикрепляем к пользователю
    aws iam attach-user-policy \
        --user-name angelina \
        --policy-arn "$POLICY_ARN" 2>/dev/null || echo "⚠️ Политика уже прикреплена"
    
    echo "✅ Права добавлены!"
    echo ""
    echo "🚀 Теперь можно запустить развертывание:"
    echo "./deploy-to-aws.sh"
else
    echo "❌ Ошибка создания политики"
    exit 1
fi
