// API Configuration
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Backend URL configuration
export const API_BASE_URL = isProduction 
  ? 'https://d9v5h1vlyh.execute-api.us-east-1.amazonaws.com/prod' // AWS API Gateway
  : 'http://localhost:3001';

// API Gateway endpoints (different from local backend)
export const API_ENDPOINTS = isProduction ? {
  UPLOAD: `${API_BASE_URL}/upload`,
  PROCESS: (fileId: string) => `${API_BASE_URL}/process/${fileId}`,
  STATUS: (fileId: string) => `${API_BASE_URL}/status/${fileId}`,
  NOTION_TEST: `${API_BASE_URL}/notion/test`,
  HEALTH: `${API_BASE_URL}/health`,
} : {
  UPLOAD: `${API_BASE_URL}/api/aws/upload`,
  PROCESS: (fileId: string) => `${API_BASE_URL}/api/aws/process/${fileId}`,
  STATUS: (fileId: string) => `${API_BASE_URL}/api/aws/status/${fileId}`,
  NOTION_TEST: `${API_BASE_URL}/api/notion/test`,
  HEALTH: `${API_BASE_URL}/health`,
} as const;

export const config = {
  API_BASE_URL,
  API_ENDPOINTS,
  isProduction,
  isDevelopment,
} as const;
