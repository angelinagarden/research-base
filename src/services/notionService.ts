import { Client } from '@notionhq/client';

// Интерфейс для элемента из Notion
export interface NotionResearchItem {
  id: string;
  title: string;
  [key: string]: any;
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
      // Используем прямой HTTP запрос, так как databases.query не существует в версии 5.0.0
      const response = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_NOTION_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          page_size: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.results.map((page: any) => ({
        id: page.id,
        title: page.properties.title?.title?.[0]?.text?.content || 'Без названия',
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
}

export default new NotionService();
