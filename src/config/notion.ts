export interface NotionResearchItem {
  id: string;
  title: string;
  [key: string]: any;
}

export const NOTION_CONFIG = {
  API_KEY: import.meta.env.VITE_NOTION_API_TOKEN,
  DATABASE_ID: import.meta.env.VITE_NOTION_DATABASE_ID,
};
