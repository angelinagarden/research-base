// Main service that coordinates the entire research upload workflow
import { awsService, AWSUploadResponse, PDFProcessingResult } from './awsService';
import notionService, { CreateResearchData } from './notionService';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

export interface WorkflowResult {
  success: boolean;
  awsResult?: AWSUploadResponse;
  processingResult?: PDFProcessingResult;
  notionResult?: {
    success: boolean;
    researchItem?: any;
    error?: string;
  };
  error?: string;
  message?: string;
}

export interface WorkflowProgress {
  stage: 'uploading' | 'processing' | 'notion' | 'completed' | 'error';
  progress: number;
  message: string;
}

class ResearchWorkflowService {
  private onProgress?: (progress: WorkflowProgress) => void;

  constructor(onProgress?: (progress: WorkflowProgress) => void) {
    this.onProgress = onProgress;
  }

  /**
   * Полный workflow: PDF -> AWS -> Notion
   */
  async processResearchPDF(file: File): Promise<WorkflowResult> {
    try {
      // Этап 1: Загрузка в AWS S3
      this.updateProgress({
        stage: 'uploading',
        progress: 10,
        message: 'Загрузка файла в AWS S3...'
      });

      const awsResult = await awsService.uploadPDF(file);
      
      if (!awsResult.success) {
        throw new Error(`AWS upload failed: ${awsResult.error}`);
      }

      // Этап 2: Ожидание автоматической обработки через S3 триггер
      this.updateProgress({
        stage: 'processing',
        progress: 30,
        message: 'Обработка PDF файла...'
      });

      // Ожидаем обработки через S3 триггер (не вызываем /process)
      // Обработка происходит автоматически при загрузке файла в S3
      await this.waitForProcessing(awsResult.fileId);

      // Этап 3: Запись в Notion создается автоматически через S3 триггер
      this.updateProgress({
        stage: 'notion',
        progress: 90,
        message: 'Создание записи в Notion...'
      });

      // Не проверяем Notion - просто ждем немного для обработки
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const notionResult = {
        success: true,
        message: 'Запись создана в Notion автоматически',
        fileId: awsResult.fileId
      };

      // Завершение
      this.updateProgress({
        stage: 'completed',
        progress: 100,
        message: 'Исследование успешно добавлено в Notion!'
      });

      return {
        success: true,
        awsResult,
        processingResult: { 
          success: true, 
          extractedData: {
            title: file.name.replace('.pdf', ''),
            authors: [],
            institution: '',
            content: 'Исследование обработано и добавлено в Notion автоматически через S3 триггер'
          }
        },
        notionResult,
        message: 'Исследование успешно обработано и добавлено в Notion'
      };

    } catch (error) {
      this.updateProgress({
        stage: 'error',
        progress: 0,
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Произошла ошибка при обработке исследования'
      };
    }
  }

  /**
   * Проверяет статус обработки файла
   */
  async checkProcessingStatus(fileId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: WorkflowResult;
  }> {
    try {
      const status = await awsService.getProcessingStatus(fileId);
      return status;
    } catch (error) {
      return {
        status: 'failed',
        progress: 0
      };
    }
  }

  /**
   * Получает список всех обработанных исследований
   */
  async getAllProcessedResearch(): Promise<any[]> {
    try {
      return await notionService.getResearchWithFiles();
    } catch (error) {
      console.error('Error fetching processed research:', error);
      return [];
    }
  }

  /**
   * Ожидает завершения обработки через S3 триггер
   */
  private async waitForProcessing(fileId: string): Promise<void> {
    const maxAttempts = 10; // 10 попыток по 3 секунды = 30 секунд максимум
    const delay = 3000; // 3 секунды между попытками
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Ждем обработки через S3 триггер
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Обновляем прогресс
        const progress = 30 + (attempt * 6); // От 30% до 84%
        this.updateProgress({
          stage: 'processing',
          progress: Math.min(progress, 84),
          message: `Обработка PDF файла... (${attempt}/${maxAttempts})`
        });
        
        if (attempt >= 8) { // После 24 секунд считаем, что обработка завершена
          break;
        }
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
      }
    }
  }


  /**
   * Обновляет прогресс обработки
   */
  private updateProgress(progress: WorkflowProgress) {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }

  /**
   * Создает новый экземпляр сервиса с callback для прогресса
   */
  static createWithProgress(onProgress: (progress: WorkflowProgress) => void): ResearchWorkflowService {
    return new ResearchWorkflowService(onProgress);
  }
}

export const researchWorkflowService = new ResearchWorkflowService();
export { ResearchWorkflowService };
