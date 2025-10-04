# 🔧 Обновление API URL

## После создания API Gateway:

1. **Скопируйте Invoke URL** из AWS Console
2. **Обновите файл** `src/config/api.ts`:

```typescript
export const API_BASE_URL = isProduction 
  ? 'https://YOUR-API-GATEWAY-URL.execute-api.us-east-1.amazonaws.com/prod'
  : 'http://localhost:3001';
```

3. **Пересоберите frontend**:
```bash
npm run build:prod
aws s3 sync dist/ s3://research-base-frontend-1759505581-angelinazajceva --delete
```

## Пример URL:
```
https://abc123def4.execute-api.us-east-1.amazonaws.com/prod
```

## Endpoints:
- POST /upload
- POST /process/{fileId}
- GET /status/{fileId}
