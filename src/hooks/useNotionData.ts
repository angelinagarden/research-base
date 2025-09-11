import { useState, useEffect, useCallback } from 'react';
import notionService from '../services/notionService';
import { NotionResearchItem } from '../config/notion';
import { ResearchRecord } from '../types/research';

export const useNotionData = () => {
  const [data, setData] = useState<NotionResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных из Notion
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await notionService.getAllResearchItems();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data from Notion');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание нового элемента
  const createItem = useCallback(async (item: Omit<NotionResearchItem, 'id'>) => {
    try {
      setError(null);
      const newItem = await notionService.createResearchItem(item);
      setData(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      throw err;
    }
  }, []);

  // Обновление элемента
  const updateItem = useCallback(async (id: string, updates: Partial<NotionResearchItem>) => {
    try {
      setError(null);
      const updatedItem = await notionService.updateResearchItem(id, updates);
      setData(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, []);

  // Удаление элемента
  const deleteItem = useCallback(async (id: string) => {
    try {
      setError(null);
      const success = await notionService.deleteResearchItem(id);
      if (success) {
        setData(prev => prev.filter(item => item.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, []);

  // Получение элемента по ID
  const getItemById = useCallback(async (id: string) => {
    try {
      setError(null);
      return await notionService.getResearchItemById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
      return null;
    }
  }, []);

  // Автоматическая загрузка при монтировании компонента
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    getItemById,
  };
};
