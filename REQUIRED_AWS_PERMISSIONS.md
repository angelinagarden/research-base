# 🔐 Необходимые права AWS для автоматического развертывания

## 📋 Минимальные права для развертывания Lambda + API Gateway:

### **IAM Policy для Lambda:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:GetFunction",
                "lambda:InvokeFunction",
                "lambda:AddPermission",
                "lambda:RemovePermission"
            ],
            "Resource": "arn:aws:lambda:us-east-1:*:function:research-base-backend*"
        }
    ]
}
```

### **IAM Policy для API Gateway:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:*"
            ],
            "Resource": "*"
        }
    ]
}
```

### **IAM Policy для IAM (создание ролей):**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole",
                "iam:GetRole",
                "iam:ListRoles"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🚀 Полная политика для автоматического развертывания:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole",
                "iam:GetRole",
                "iam:ListRoles",
                "iam:ListPolicies"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "textract:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📝 Как добавить права:

### **Вариант 1: AWS Console**
1. Откройте AWS Console → IAM
2. Перейдите в **Users** → `angelina`
3. Нажмите **Add permissions** → **Attach policies directly**
4. Создайте новую политику с правами выше
5. Прикрепите к пользователю

### **Вариант 2: AWS CLI**
```bash
# Создать политику
aws iam create-policy \
    --policy-name ResearchBaseDeploymentPolicy \
    --policy-document file://deployment-policy.json

# Прикрепить к пользователю
aws iam attach-user-policy \
    --user-name angelina \
    --policy-arn arn:aws:iam::664631055520:policy/ResearchBaseDeploymentPolicy
```

## 🎯 Минимальные права для быстрого развертывания:

Если хотите дать минимальные права только для развертывания:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:CreateFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:AddPermission"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:POST",
                "apigateway:GET",
                "apigateway:PUT",
                "apigateway:DELETE"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": "arn:aws:iam::664631055520:role/lambda-execution-role"
        }
    ]
}
```

## 🚀 После добавления прав:

```bash
cd /Users/angelinazajceva/research-base
./deploy-to-aws.sh
```

## 💡 Альтернатива - временные права:

Можете дать мне временные права только на развертывание, а потом убрать их.

## 🔍 Проверка текущих прав:

```bash
aws iam get-user
aws iam list-attached-user-policies --user-name angelina
aws iam list-user-policies --user-name angelina
```
