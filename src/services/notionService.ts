import { Client } from '@notionhq/client';

// Интерфейс для элемента из Notion
export interface NotionResearchItem {
  id: string;
  title: string;
  [key: string]: any;
}

// Интерфейс для извлеченных данных из PDF
export interface ExtractedPDFData {
  title?: string;
  authors?: string[];
  abstract?: string;
  keywords?: string[];
  publicationDate?: string;
  doi?: string;
  institution?: string;
  content?: string;
  fileUrl?: string;
  googleDriveUrl?: string;
}

// Интерфейс для создания исследования в Notion
export interface CreateResearchData {
  title: string;
  authors?: string;
  abstract?: string;
  keywords?: string;
  publicationDate?: string;
  doi?: string;
  institution?: string;
  content?: string;
  fileUrl?: string;
  googleDriveUrl?: string;
  source?: string;
  tags?: string[];
}

class NotionService {
  private client: Client;
  private databaseId: string;

  constructor() {
    const apiKey = import.meta.env.VITE_NOTION_API_TOKEN;
    this.databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;

    if (!apiKey || !this.databaseId) {
      throw new Error('Notion API credentials not configured');
    }

    this.client = new Client({ auth: apiKey });
  }

  // Получить все исследования
  async getAllResearchItems(): Promise<NotionResearchItem[]> {
    try {
      // Используем правильный API endpoint
      const response = await fetch('https://d9v5h1vlyh.execute-api.us-east-1.amazonaws.com/prod/notion/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.results.map((page: any) => ({
        id: page.id,
        title: page.properties.TitleOriginal?.title?.[0]?.text?.content || 
               page.properties.TitleShort?.rich_text?.[0]?.text?.content || 
               'Без названия',
        // Добавляем другие поля по мере необходимости
        ...page.properties,
      }));
    } catch (error) {
      console.error('Error fetching from Notion:', error);
      console.error('Error details:', error);
      throw error;
    }
  }

  // Создать новое исследование
  async createResearchItem(item: Omit<NotionResearchItem, 'id'>): Promise<NotionResearchItem> {
    try {
      const response = await this.client.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          title: {
            title: [{ text: { content: item.title } }]
          }
        }
      });

      return {
        id: response.id,
        title: item.title,
        ...item
      };
    } catch (error) {
      console.error('Error creating in Notion:', error);
      throw error;
    }
  }

  // Обновить исследование
  async updateResearchItem(id: string, updates: Partial<NotionResearchItem>): Promise<NotionResearchItem> {
    try {
      const response = await this.client.pages.update({
        page_id: id,
        properties: {
          title: {
            title: [{ text: { content: updates.title || '' } }]
          }
        }
      });

      return {
        id: response.id,
        title: updates.title || '',
        ...updates
      };
    } catch (error) {
      console.error('Error updating in Notion:', error);
      throw error;
    }
  }

  // Удалить исследование
  async deleteResearchItem(id: string): Promise<boolean> {
    try {
      await this.client.pages.update({
        page_id: id,
        archived: true
      });
      return true;
    } catch (error) {
      console.error('Error deleting from Notion:', error);
      throw error;
    }
  }

  // Получить исследование по ID
  async getResearchItemById(id: string): Promise<NotionResearchItem | null> {
    try {
      const response = await this.client.pages.retrieve({ page_id: id });
      return {
        id: (response as any).id,
        title: (response as any).properties.title?.title?.[0]?.text?.content || 'Без названия',
        ...(response as any).properties
      };
    } catch (error) {
      console.error('Error fetching item from Notion:', error);
      return null;
    }
  }

  // Создать исследование из извлеченных данных PDF
  async createResearchFromPDF(data: CreateResearchData): Promise<{
    success: boolean;
    researchItem?: NotionResearchItem;
    error?: string;
  }> {
    try {
      const properties: any = {
        TitleOriginal: {
          title: [{ text: { content: data.title } }]
        }
      };

      // Добавляем авторов, если есть
      if (data.authors) {
        properties.AuthorsOrg = {
          rich_text: [{ text: { content: data.authors } }]
        };
      }

      // Добавляем абстракт, если есть
      if (data.abstract) {
        properties.CentralInsight = {
          rich_text: [{ text: { content: data.abstract } }]
        };
      }

      // Добавляем детальный контент
      if (data.content) {
        properties.DetailedContent = {
          rich_text: [{ text: { content: data.content } }]
        };
      }

      // Добавляем URL файла
      if (data.fileUrl) {
        properties.URL = {
          url: data.fileUrl
        };
      }

      // Добавляем дату публикации
      if (data.publicationDate) {
        properties.DatePublished = {
          date: { start: data.publicationDate }
        };
      }

      // Добавляем DOI
      if (data.doi) {
        properties.DOI = {
          rich_text: [{ text: { content: data.doi } }]
        };
      }

      // Добавляем институцию
      if (data.institution) {
        properties.Institution = {
          rich_text: [{ text: { content: data.institution } }]
        };
      }

      // Добавляем теги
      if (data.tags && data.tags.length > 0) {
        properties.Tags = {
          multi_select: data.tags.map(tag => ({ name: tag }))
        };
      }

      // Добавляем тип публикации
      properties.PubType = {
        select: { name: data.source || 'PDF Upload' }
      };

      // Создаем страницу в Notion
      const response = await this.client.pages.create({
        parent: { database_id: this.databaseId },
        properties
      });

      return {
        success: true,
        researchItem: {
          id: response.id,
          title: data.title,
          ...data
        }
      };
    } catch (error) {
      console.error('Error creating research from PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Добавить файл к существующему исследованию
  async addFileToResearch(researchId: string, fileUrl: string, googleDriveUrl?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const properties: any = {};

      if (fileUrl) {
        properties.FileURL = {
          url: fileUrl
        };
      }

      if (googleDriveUrl) {
        properties.GoogleDriveURL = {
          url: googleDriveUrl
        };
      }

      await this.client.pages.update({
        page_id: researchId,
        properties
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding file to research:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Получить все исследования с файлами
  async getResearchWithFiles(): Promise<NotionResearchItem[]> {
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'FileURL',
          url: {
            is_not_empty: true
          }
        }
      });

      return response.results.map((page: any) => ({
        id: page.id,
        title: page.properties.TitleOriginal?.title?.[0]?.text?.content || 'Без названия',
        ...page.properties
      }));
    } catch (error) {
      console.error('Error fetching research with files:', error);
      throw error;
    }
  }
}

export default new NotionService();
