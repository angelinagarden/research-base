// Notion Service for Research Base integration
const { Client } = require('@notionhq/client');
const crypto = require('crypto');
const fs = require('fs');

class NotionService {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
    this.databaseId = process.env.NOTION_DATABASE_ID;
  }

  /**
   * Create a research entry in Notion with file attachment
   */
  async createResearchEntry(aiData, filePath, s3Url = null) {
    try {
      // Prepare file attachment
      let attachment = null;
      if (s3Url) {
        // Use S3 URL
        attachment = {
          label: "Research PDF",
          kind: "pdf",
          filename: filePath.split('/').pop(),
          mimetype: "application/pdf",
          bytes: 0, // Will be calculated if needed
          sha256: "", // Will be calculated if needed
          file: {
            mode: "s3_url",
            url: s3Url
          }
        };
      } else if (fs.existsSync(filePath)) {
        // Read file and encode as base64
        const fileBuffer = fs.readFileSync(filePath);
        const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const base64Content = fileBuffer.toString('base64');
        
        attachment = {
          label: "Research PDF",
          kind: "pdf", 
          filename: filePath.split('/').pop(),
          mimetype: "application/pdf",
          bytes: fileBuffer.length,
          sha256: sha256,
          file: {
            mode: "base64",
            content_base64: base64Content
          }
        };
      }

      // Prepare properties for Notion using actual field names
      const properties = {
        "title": {
          title: [
            {
              text: {
                content: aiData.title || "Untitled Research"
              }
            }
          ]
        },
        "Authors": {
          rich_text: [
            {
              text: {
                content: Array.isArray(aiData.authors) ? aiData.authors.join(", ") : aiData.authors || "Unknown Author"
              }
            }
          ]
        },
        "CentralInsight": {
          rich_text: [
            {
              text: {
                content: aiData.summary || aiData.abstract || "No central insight available"
              }
            }
          ]
        },
        "DOI": {
          rich_text: [
            {
              text: {
                content: aiData.doi || ""
              }
            }
          ]
        },
        "DatePublished": {
          date: {
            start: aiData.published_date || new Date().toISOString().split('T')[0]
          }
        },
        "DetailedContent": {
          rich_text: [
            {
              text: {
                content: `**Abstract:**\n${aiData.abstract || "No abstract available"}\n\n**Summary:**\n${aiData.summary || "No summary available"}\n\n**Key Findings:**\n${Array.isArray(aiData.key_findings) ? aiData.key_findings.map(f => `• ${f}`).join("\n") : "No key findings available"}`
              }
            }
          ]
        },
        "PotentialApplication": {
          rich_text: [
            {
              text: {
                content: aiData.impact_use || "No potential application available"
              }
            }
          ]
        },
        "Organization": {
          rich_text: [
            {
              text: {
                content: aiData.venue || "Unknown Organization"
              }
            }
          ]
        },
        "PubType": {
          multi_select: [
            {
              name: aiData.type || "article"
            }
          ]
        },
        "Tags": {
          multi_select: (aiData.tags || []).map(tag => ({ name: tag }))
        },
        "TitleShort": {
          rich_text: [
            {
              text: {
                content: aiData.title ? aiData.title.substring(0, 100) + (aiData.title.length > 100 ? "..." : "") : "Untitled"
              }
            }
          ]
        },
        "URL": {
          url: aiData.source_url || null
        }
      };

      // Create the page
      const response = await this.notion.pages.create({
        parent: {
          database_id: this.databaseId
        },
        properties: properties
      });

      // If we have an attachment, add it to the page
      if (attachment) {
        try {
          await this.notion.pages.update({
            page_id: response.id,
            properties: {
              "attachments": {
                rich_text: [
                  {
                    text: {
                      content: `📎 ${attachment.filename} (${attachment.bytes} bytes)`
                    }
                  }
                ]
              }
            }
          });
        } catch (error) {
          console.log('Could not add attachment info:', error.message);
        }
      }

      return {
        success: true,
        pageId: response.id,
        url: response.url,
        attachment: attachment
      };

    } catch (error) {
      console.error('Notion creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test Notion API connection
   */
  async testConnection() {
    try {
      const response = await this.notion.databases.retrieve({
        database_id: this.databaseId
      });
      
      return {
        success: true,
        databaseTitle: response.title[0]?.plain_text || "Unknown",
        databaseId: this.databaseId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate required fields
   */
  validateData(aiData) {
    const required = ['title', 'authors', 'published_date', 'venue', 'type', 'language'];
    const missing = required.filter(field => !aiData[field]);
    
    if (missing.length > 0) {
      return {
        valid: false,
        missing: missing
      };
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(aiData.published_date)) {
      return {
        valid: false,
        error: 'published_date must be in YYYY-MM-DD format'
      };
    }

    // Validate type
    const validTypes = ['article', 'preprint', 'report', 'chapter', 'book', 'thesis', 'dataset', 'video', 'webpage'];
    if (!validTypes.includes(aiData.type)) {
      return {
        valid: false,
        error: `type must be one of: ${validTypes.join(', ')}`
      };
    }

    // Validate key_findings count
    if (aiData.key_findings && (aiData.key_findings.length < 3 || aiData.key_findings.length > 7)) {
      return {
        valid: false,
        error: 'key_findings must have 3-7 items'
      };
    }

    return { valid: true };
  }
}

module.exports = { NotionService };
