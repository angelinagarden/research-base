// Google Drive Service for file storage and management
export interface GoogleDriveUploadResponse {
  success: boolean;
  fileId: string;
  webViewLink: string;
  error?: string;
}

export interface GoogleDriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

class GoogleDriveService {
  private baseUrl: string;

  constructor() {
    // В реальном проекте это будет URL вашего сервера, который взаимодействует с Google Drive API
    this.baseUrl = process.env.VITE_GOOGLE_DRIVE_API_URL || 'https://d9v5h1vlyh.execute-api.us-east-1.amazonaws.com/prod/google-drive';
  }

  /**
   * Загружает файл в Google Drive
   */
  async uploadFile(file: File, folderId?: string): Promise<GoogleDriveUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) {
        formData.append('folderId', folderId);
      }

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      return {
        success: false,
        fileId: '',
        webViewLink: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Создает папку в Google Drive
   */
  async createFolder(folderName: string, parentFolderId?: string): Promise<{
    success: boolean;
    folderId?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/create-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          parentFolderId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating folder in Google Drive:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Получает информацию о файле
   */
  async getFileInfo(fileId: string): Promise<{
    success: boolean;
    fileInfo?: GoogleDriveFileInfo;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/file/${fileId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting file info from Google Drive:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Получает список файлов в папке
   */
  async listFiles(folderId?: string): Promise<{
    success: boolean;
    files?: GoogleDriveFileInfo[];
    error?: string;
  }> {
    try {
      const url = folderId 
        ? `${this.baseUrl}/files?folderId=${folderId}`
        : `${this.baseUrl}/files`;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Удаляет файл из Google Drive
   */
  async deleteFile(fileId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/file/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Загружает файл в специальную папку для исследований
   */
  async uploadResearchFile(file: File, researchTitle: string): Promise<GoogleDriveUploadResponse> {
    try {
      // Создаем папку для исследований, если её нет
      const folderResult = await this.createFolder('Research Files', undefined);
      
      if (!folderResult.success && !folderResult.folderId) {
        return {
          success: false,
          fileId: '',
          webViewLink: '',
          error: folderResult.error || 'Failed to create research folder'
        };
      }

      // Создаем подпапку для конкретного исследования
      const researchFolderResult = await this.createFolder(
        researchTitle.replace(/[^a-zA-Z0-9\s]/g, ''), // Убираем специальные символы
        folderResult.folderId
      );

      const targetFolderId = researchFolderResult.success 
        ? researchFolderResult.folderId 
        : folderResult.folderId;

      // Загружаем файл
      return await this.uploadFile(file, targetFolderId);
    } catch (error) {
      console.error('Error uploading research file to Google Drive:', error);
      return {
        success: false,
        fileId: '',
        webViewLink: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
