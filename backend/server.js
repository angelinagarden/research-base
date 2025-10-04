// Backend server for handling file uploads and processing
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { AWSService } = require('./aws-config');
const { AIService } = require('./ai-service');
const { NotionService } = require('./notion-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Upload directory
const uploadsDir = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Для тестирования принимаем PDF и текстовые файлы
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed for testing'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  try {
    fs.accessSync('uploads');
  } catch {
    fs.mkdirSync('uploads', { recursive: true });
  }
};

// AWS S3 real upload endpoint
app.post('/api/aws/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('AWS credentials not configured, using simulation');
      
      // Fallback to simulation
      const fileId = Date.now().toString();
      const fileUrl = `https://s3.amazonaws.com/research-bucket/${req.file.filename}`;

      console.log(`File uploaded (simulation): ${req.file.originalname} -> ${req.file.filename}`);

      return res.json({
        success: true,
        fileId: fileId,
        fileUrl: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mode: 'simulation'
      });
    }

    // Real AWS S3 upload
    const awsService = new AWSService();
    const fileName = `research-${Date.now()}-${req.file.originalname}`;
    
    const uploadResult = await awsService.uploadToS3(req.file, fileName);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        error: uploadResult.error
      });
    }

    console.log(`File uploaded to AWS S3: ${req.file.originalname} -> ${fileName}`);

    res.json({
      success: true,
      fileId: uploadResult.fileId,
      fileUrl: uploadResult.fileUrl,
      filename: fileName,
      originalName: req.file.originalname,
      size: req.file.size,
      mode: 'aws'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PDF processing with real AWS Textract and AI
app.post('/api/aws/process/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('AWS credentials not configured, using simulation');
      
      // Fallback to simulation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const extractedData = {
        title: `Research Paper ${fileId}`,
        authors: ['Dr. John Smith', 'Prof. Jane Doe'],
        abstract: 'This is a simulated abstract extracted from the PDF document. In a real implementation, this would be extracted using AWS Textract or similar services.',
        keywords: ['research', 'artificial intelligence', 'machine learning', 'data analysis'],
        publicationDate: '2024-01-15',
        doi: '10.1000/182',
        institution: 'Stanford University',
        content: 'This is the full content of the research paper extracted from the PDF. In a real implementation, this would be the complete text extracted from the document.'
      };

      return res.json({
        success: true,
        extractedData: extractedData,
        mode: 'simulation'
      });
    }

    // Real processing with AWS Textract + AI + Notion
    const awsService = new AWSService();
    const aiService = new AIService();
    const notionService = new NotionService();
    
    console.log(`Starting real processing for file: ${fileId}`);
    
    // Get file path
    const filePath = path.join(uploadsDir, fileId);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    // Step 1: Extract text - handle both PDF and text files
    let extractedText;
    if (fileId.endsWith('.txt')) {
      // For text files, read directly
      extractedText = fs.readFileSync(filePath, 'utf8');
      console.log(`Text file read directly, length: ${extractedText.length}`);
    } else {
      // For PDFs, use AWS Textract
      const textractResult = await awsService.extractTextFromPDF(fileId);
      
      if (!textractResult.success) {
        console.log('Textract failed, using fallback text');
        extractedText = 'PDF file uploaded. Text extraction requires AWS Textract subscription.';
      } else {
        extractedText = textractResult.extractedText;
        console.log(`Text extracted from PDF, length: ${extractedText.length}`);
      }
    }

    // Step 2: Process text with AI
    const aiResult = await aiService.processResearchText(extractedText);
    
    if (!aiResult.success) {
      console.log('AI processing failed, using fallback');
      // Fallback to simple parsing
      const fallbackResult = await aiService.processWithFallback(extractedText);
      return res.json({
        success: fallbackResult.success,
        extractedData: fallbackResult.extractedData,
        mode: 'fallback',
        error: fallbackResult.error
      });
    }

    console.log('AI processing completed successfully');

    // Step 3: Upload to S3
    const s3Result = await awsService.uploadToS3(filePath, fileId);
    if (!s3Result.success) {
      console.log('S3 upload failed:', s3Result.error);
    }

    // Step 4: Create Notion entry
    let notionResult = null;
    if (process.env.NOTION_API_KEY && process.env.NOTION_API_KEY !== 'your_notion_api_token_here') {
      notionResult = await notionService.createResearchEntry(
        aiResult.extractedData, 
        filePath, 
        s3Result.success ? s3Result.url : null
      );
      
      if (notionResult.success) {
        console.log('Notion entry created:', notionResult.pageId);
      } else {
        console.log('Notion creation failed:', notionResult.error);
      }
    } else {
      console.log('Notion API not configured, skipping Notion integration');
    }

    res.json({
      success: true,
      extractedData: aiResult.extractedData,
      s3Url: s3Result.success ? s3Result.url : null,
      notionEntry: notionResult,
      mode: 'aws+ai+notion'
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Processing status endpoint
app.get('/api/aws/status/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Simulate processing status
    res.json({
      status: 'completed',
      progress: 100,
      result: {
        success: true,
        extractedData: {
          title: `Research Paper ${fileId}`,
          authors: ['Dr. John Smith'],
          abstract: 'Sample abstract'
        }
      }
    });

  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      status: 'failed',
      progress: 0,
      error: error.message
    });
  }
});

// Google Drive simulation endpoint
app.post('/api/google-drive/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Simulate Google Drive upload
    const fileId = `gdrive_${Date.now()}`;
    const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;

    console.log(`File uploaded to Google Drive: ${req.file.originalname}`);

    res.json({
      success: true,
      fileId: fileId,
      webViewLink: webViewLink,
      filename: req.file.filename,
      originalName: req.file.originalname
    });

  } catch (error) {
    console.error('Google Drive upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create folder endpoint
app.post('/api/google-drive/create-folder', async (req, res) => {
  try {
    const { name, parentFolderId } = req.body;
    
    // Simulate folder creation
    const folderId = `folder_${Date.now()}`;
    
    res.json({
      success: true,
      folderId: folderId,
      name: name
    });

  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Notion integration endpoints
app.post('/api/notion/query', async (req, res) => {
  try {
    // В реальном проекте здесь будет запрос к Notion API
    // Пока возвращаем симуляцию
    const mockData = {
      results: [
        {
          id: 'mock-id-1',
          properties: {
            TitleOriginal: {
              title: [{ text: { content: 'Test Research Paper' } }]
            },
            AuthorsOrg: {
              rich_text: [{ text: { content: 'Dr. John Smith, Prof. Jane Doe' } }]
            },
            CentralInsight: {
              rich_text: [{ text: { content: 'This is a test research paper for demonstrating the PDF upload system.' } }]
            },
            Tags: {
              multi_select: [
                { name: 'research' },
                { name: 'testing' },
                { name: 'demonstration' }
              ]
            }
          }
        }
      ]
    };

    res.json(mockData);
  } catch (error) {
    console.error('Notion query error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notion/create', async (req, res) => {
  try {
    const { title, authors, abstract, content, fileUrl, googleDriveUrl } = req.body;
    
    // В реальном проекте здесь будет создание записи в Notion
    // Пока возвращаем симуляцию
    const mockResponse = {
      id: `notion-${Date.now()}`,
      properties: {
        TitleOriginal: { title: [{ text: { content: title } }] },
        AuthorsOrg: { rich_text: [{ text: { content: authors || '' } }] },
        CentralInsight: { rich_text: [{ text: { content: abstract || '' } }] },
        DetailedContent: { rich_text: [{ text: { content: content || '' } }] },
        URL: { url: fileUrl || '' },
        GoogleDriveURL: { url: googleDriveUrl || '' }
      }
    };

    console.log('Created Notion entry:', mockResponse);
    res.json({ success: true, researchItem: mockResponse });
  } catch (error) {
    console.error('Notion create error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test Notion API configuration
app.post('/api/notion/test', async (req, res) => {
  try {
    if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_token_here') {
      return res.status(400).json({
        success: false,
        error: 'Notion API key not configured. Please update .env file with your Notion integration token.'
      });
    }

    if (!process.env.NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID === 'your_database_id_here') {
      return res.status(400).json({
        success: false,
        error: 'Notion Database ID not configured. Please update .env file with your database ID.'
      });
    }

    // Test actual connection to Notion
    const notionService = new NotionService();
    const connectionTest = await notionService.testConnection();
    
    if (connectionTest.success) {
      res.json({
        success: true,
        message: 'Notion API configured correctly',
        databaseTitle: connectionTest.databaseTitle,
        databaseId: process.env.NOTION_DATABASE_ID,
        apiKey: process.env.NOTION_API_KEY.substring(0, 10) + '...'
      });
    } else {
      res.status(400).json({
        success: false,
        error: `Notion connection failed: ${connectionTest.error}`
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
const startServer = async () => {
  ensureUploadsDir();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${path.resolve('uploads')}`);
  });
};

startServer().catch(console.error);
