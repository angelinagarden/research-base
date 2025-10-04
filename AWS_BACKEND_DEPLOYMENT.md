# 🚀 Развертывание Backend в AWS

## 📋 Варианты развертывания:

### 1. **AWS Lambda + API Gateway** (Рекомендуется)
```bash
# Установите Serverless Framework
npm install -g serverless

# Перейдите в папку lambda
cd aws-lambda-backend

# Деплой
serverless deploy
```

### 2. **AWS EC2** (Простой)
```bash
# Создайте EC2 instance
aws ec2 run-instances --image-id ami-0c02fb55956c7d316 --count 1 --instance-type t2.micro

# Подключитесь к instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Установите Node.js
sudo yum update -y
sudo yum install -y nodejs npm

# Скопируйте код
scp -r backend/ ec2-user@your-instance-ip:~/

# Запустите backend
cd backend && npm install && npm start
```

### 3. **AWS App Runner** (Контейнерный)
```bash
# Создайте Dockerfile (уже создан в aws-app-runner/)
# Загрузите в ECR
aws ecr create-repository --repository-name research-base-backend

# Создайте App Runner service через AWS Console
```

### 4. **AWS Elastic Beanstalk** (Управляемый)
```bash
# Установите EB CLI
pip3 install awsebcli --user

# Инициализируйте приложение
cd backend
eb init

# Создайте окружение
eb create production

# Деплой
eb deploy
```

## 🔧 Текущее решение (ngrok)

Пока backend развертывается, используйте ngrok:

```bash
# Запустите backend локально
cd backend && npm start

# В другом терминале запустите ngrok
ngrok http 3001

# Обновите frontend конфигурацию с новым URL
```

## 🌐 Обновление Frontend

После развертывания backend обновите `src/config/api.ts`:

```typescript
export const API_BASE_URL = isProduction 
  ? 'https://your-backend-domain.com' // Замените на ваш URL
  : 'http://localhost:3001';
```

## 📊 Мониторинг

После развертывания проверьте:
- Health endpoint: `https://your-backend-url/health`
- API endpoints: `https://your-backend-url/api/aws/upload`
- Notion test: `https://your-backend-url/api/notion/test`

## 💰 Стоимость

- **Lambda**: ~$0.20/млн запросов
- **EC2 t2.micro**: ~$8.50/месяц
- **App Runner**: ~$25/месяц
- **Elastic Beanstalk**: ~$15/месяц

## 🚀 Рекомендация

Для начала используйте **AWS Lambda + API Gateway** - это самый экономичный и масштабируемый вариант.
