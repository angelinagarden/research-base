// AWS Configuration and Services
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { TextractClient, StartDocumentTextDetectionCommand, GetDocumentTextDetectionCommand } = require('@aws-sdk/client-textract');

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// Initialize AWS clients
const s3Client = new S3Client(awsConfig);
const textractClient = new TextractClient(awsConfig);

// S3 Configuration
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'research-files-bucket';

class AWSService {
  /**
   * Upload file to S3
   */
  async uploadToS3(file, fileName) {
    try {
      const uploadParams = {
        Bucket: S3_BUCKET,
        Key: `research-papers/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype
        // Removed ACL as it's not allowed by default in newer buckets
      };

      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);

      // Generate public URL
      const fileUrl = `https://${S3_BUCKET}.s3.${awsConfig.region}.amazonaws.com/research-papers/${fileName}`;

      return {
        success: true,
        fileUrl,
        fileId: fileName,
        etag: result.ETag
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract text from PDF using Textract
   */
  async extractTextFromPDF(s3FileKey) {
    try {
      // Start document text detection job
      const startCommand = new StartDocumentTextDetectionCommand({
        DocumentLocation: {
          S3Object: {
            Bucket: S3_BUCKET,
            Name: s3FileKey
          }
        }
      });

      const startResult = await textractClient.send(startCommand);
      const jobId = startResult.JobId;

      // Poll for job completion
      let jobStatus = 'IN_PROGRESS';
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max

      while (jobStatus === 'IN_PROGRESS' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        const getCommand = new GetDocumentTextDetectionCommand({
          JobId: jobId
        });

        const getResult = await textractClient.send(getCommand);
        jobStatus = getResult.JobStatus;
        attempts++;

        if (jobStatus === 'SUCCEEDED') {
          // Extract text from blocks
          const extractedText = this.extractTextFromBlocks(getResult.Blocks);
          
          return {
            success: true,
            extractedText,
            jobId
          };
        } else if (jobStatus === 'FAILED') {
          return {
            success: false,
            error: 'Textract job failed'
          };
        }
      }

      return {
        success: false,
        error: 'Textract job timeout'
      };

    } catch (error) {
      console.error('Textract error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract text from Textract blocks
   */
  extractTextFromBlocks(blocks) {
    if (!blocks) return '';

    // Sort blocks by reading order
    const sortedBlocks = blocks
      .filter(block => block.BlockType === 'LINE')
      .sort((a, b) => {
        if (a.Page !== b.Page) return a.Page - b.Page;
        return a.Geometry.BoundingBox.Top - b.Geometry.BoundingBox.Top;
      });

    return sortedBlocks
      .map(block => block.Text)
      .join('\n');
  }

  /**
   * Get file from S3 (for processing)
   */
  async getFileFromS3(fileKey) {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileKey
      });

      const result = await s3Client.send(command);
      return {
        success: true,
        data: result.Body
      };
    } catch (error) {
      console.error('S3 get error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  AWSService,
  S3_BUCKET
};
