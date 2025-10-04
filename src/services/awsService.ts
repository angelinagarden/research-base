// AWS Service for handling PDF processing and file uploads
export interface AWSUploadResponse {
  success: boolean;
  fileUrl: string;
  fileId: string;
  error?: string;
}

export interface PDFProcessingResult {
  success: boolean;
  extractedData: {
    title?: string;
    authors?: string[];
    abstract?: string;
    keywords?: string[];
    publicationDate?: string;
    doi?: string;
    institution?: string;
    content?: string;
  };
  error?: string;
}

class AWSService {
  private baseUrl: string;

  constructor() {
    // Используем API Gateway URL для production
    const isProduction = import.meta.env.PROD;
    this.baseUrl = isProduction 
      ? 'https://d9v5h1vlyh.execute-api.us-east-1.amazonaws.com/prod'
      : 'http://localhost:3001/api/aws';
  }

  /**
   * Получает presigned URL для загрузки PDF файла в AWS S3
   */
  async uploadPDF(file: File): Promise<AWSUploadResponse> {
    try {
      const isProduction = import.meta.env.PROD;
      const endpoint = isProduction ? `${this.baseUrl}/upload` : `${this.baseUrl}/upload`;
      
      // Сначала получаем presigned URL
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.uploadUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Проверяем, это тестовый режим или реальный presigned URL
      if (result.message && (result.message.includes('Mock upload URL') || result.message.includes('test mode'))) {
        // В тестовом режиме не загружаем файл на S3
        return {
          success: true,
          fileUrl: result.fileUrl,
          fileId: result.fileId,
        };
      }

      // Загружаем файл на presigned URL
      const uploadResponse = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.status}`);
      }

      return {
        success: true,
        fileUrl: result.uploadUrl.split('?')[0], // URL без параметров
        fileId: result.fileId,
      };
    } catch (error) {
      console.error('Error uploading to AWS:', error);
      return {
        success: false,
        fileUrl: '',
        fileId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Обрабатывает PDF файл через AWS Textract и другие сервисы
   */
  async processPDF(fileId: string): Promise<PDFProcessingResult> {
    try {
      const isProduction = import.meta.env.PROD;
      const endpoint = isProduction ? `${this.baseUrl}/process/${fileId}` : `${this.baseUrl}/process/${fileId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        success: false,
        extractedData: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Получает статус обработки файла
   */
  async getProcessingStatus(fileId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: PDFProcessingResult;
  }> {
    try {
      const isProduction = import.meta.env.PROD;
      const endpoint = isProduction ? `${this.baseUrl}/status/${fileId}` : `${this.baseUrl}/status/${fileId}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting processing status:', error);
      return {
        status: 'failed',
        progress: 0
      };
    }
  }

  /**
   * Полный workflow: загрузка + обработка PDF
   */
  async uploadAndProcessPDF(file: File): Promise<{
    uploadResult: AWSUploadResponse;
    processingResult?: PDFProcessingResult;
    error?: string;
  }> {
    try {
      // 1. Загружаем файл в S3
      const uploadResult = await this.uploadPDF(file);
      
      if (!uploadResult.success) {
        return {
          uploadResult,
          error: uploadResult.error
        };
      }

      // 2. Запускаем обработку
      const processingResult = await this.processPDF(uploadResult.fileId);
      
      return {
        uploadResult,
        processingResult
      };
    } catch (error) {
      return {
        uploadResult: {
          success: false,
          fileUrl: '',
          fileId: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const awsService = new AWSService();
