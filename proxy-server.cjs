const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config({ path: './.env.local' });

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Notion client
const notion = new Client({ auth: process.env.VITE_NOTION_API_TOKEN });

// Proxy endpoint for Notion database query
app.post('/api/notion/query', async (req, res) => {
  try {
    console.log('Querying Notion database...');
    
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.VITE_NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_NOTION_API_TOKEN}`,
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
    res.json(data);
  } catch (error) {
    console.error('Error querying Notion:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

app.listen(port, () => {
  console.log(`🚀 Proxy server running on http://localhost:${port}`);
  console.log(`📊 Notion database ID: ${process.env.VITE_NOTION_DATABASE_ID}`);
});
