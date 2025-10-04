const AWS = require('aws-sdk');
const axios = require('axios');

const s3 = new AWS.S3();
const textract = new AWS.Textract();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Получаем информацию о загруженном файле
        const bucket = event.Records[0].s3.bucket.name;
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        
        console.log(`Processing file: ${key} from bucket: ${bucket}`);
        
        // Извлекаем текст из PDF
        const extractedText = await extractTextFromPDF(bucket, key);
        
        // Обрабатываем с помощью AI
        const aiResult = await processWithAI(extractedText);
        
        // Сохраняем результат в S3
        const resultKey = `processed/${key.replace('uploads/', '').replace('.pdf', '')}-result.json`;
        await s3.putObject({
            Bucket: bucket,
            Key: resultKey,
            Body: JSON.stringify(aiResult, null, 2),
            ContentType: 'application/json'
        }).promise();
        
        console.log(`Result saved to: ${resultKey}`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                extractedData: aiResult,
                resultLocation: `s3://${bucket}/${resultKey}`
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

async function extractTextFromPDF(bucket, key) {
    try {
        const params = {
            Document: {
                S3Object: {
                    Bucket: bucket,
                    Name: key
                }
            }
        };
        
        const result = await textract.detectDocumentText(params).promise();
        
        return result.Blocks
            .filter(block => block.BlockType === 'LINE')
            .map(block => block.Text)
            .join('\n');
            
    } catch (error) {
        console.log('Textract failed, using fallback');
        return 'PDF file uploaded. Text extraction requires AWS Textract subscription.';
    }
}

async function processWithAI(text) {
    try {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        
        if (!openaiApiKey) {
            return await fallbackProcessing(text);
        }
        
        const prompt = `
Проанализируй следующий текст научной публикации и извлеки структурированные данные.

Текст публикации:
${text}

Извлеки и верни в формате JSON следующие данные:
{
  "title": "полное название публикации на языке оригинала",
  "authors": ["Фамилия Имя", "Фамилия Имя"],
  "published_date": "YYYY-MM-DD (если только год, используй YYYY-12-31; если год-месяц, используй последний день месяца)",
  "venue": "журнал/издание/организация",
  "type": "одно из: article | preprint | report | chapter | book | thesis | dataset | video | webpage",
  "language": "ISO 639-1 код языка (ru, en, etc.)",
  "source_url": "URL источника если есть, иначе пустая строка",
  "doi": "DOI без префикса https (например: 10.1145/1234567.8901234)",
  "abstract": "аннотация как в PDF",
  "summary": "120-160 слов, краткое резюме для базы",
  "key_findings": ["краткий вывод 1", "краткий вывод 2", "краткий вывод 3", "краткий вывод 4"],
  "tags": ["тег1", "тег2", "тег3"],
  "impact_use": "практическая польза/как применять"
}

Жёсткие правила:
- authors: минимум 1 элемент, формат "Фамилия Имя"
- published_date: всегда полная дата YYYY-MM-DD
- type: строго из списка выше
- language: ISO 639-1 код
- key_findings: минимум 3, максимум 7 пунктов
- summary: примерно 120-160 слов
- tags: релевантные теги для области исследования

Важно: отвечай ТОЛЬКО JSON, без дополнительного текста.
`;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Ты эксперт по анализу научных статей. Извлекаешь структурированные данные из текста.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return JSON.parse(response.data.choices[0].message.content);
        
    } catch (error) {
        console.error('AI processing failed:', error);
        return await fallbackProcessing(text);
    }
}

async function fallbackProcessing(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
        title: lines[0] || 'Untitled Research Paper',
        authors: ['Unknown Author'],
        published_date: new Date().toISOString().split('T')[0],
        venue: 'Unknown Venue',
        type: 'article',
        language: 'en',
        source_url: '',
        doi: '',
        abstract: lines.slice(2, 5).join(' ').substring(0, 500),
        summary: 'Research paper summary extracted from document content.',
        key_findings: [
            'Key finding 1 from the research',
            'Key finding 2 from the research',
            'Key finding 3 from the research'
        ],
        tags: ['research', 'study'],
        impact_use: 'Research findings can be applied in various contexts'
    };
}
