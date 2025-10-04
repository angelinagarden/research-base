// Backend Configuration Example
// Copy this file to config.js and fill in your actual values

module.exports = {
  // Server Configuration
  port: process.env.PORT || 3001,

  // AWS Configuration (when you set up real AWS)
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your_aws_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your_aws_secret_key',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'research-files-bucket'
  },

  // Google Drive Configuration (when you set up real Google Drive API)
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || 'your_google_client_id',
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || 'your_google_client_secret',
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN || 'your_google_refresh_token'
  },

  // Notion Configuration (same as frontend)
  notion: {
    apiToken: process.env.NOTION_API_TOKEN || 'your_notion_api_token',
    databaseId: process.env.NOTION_DATABASE_ID || 'your_notion_database_id'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  }
};
