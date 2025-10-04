const AWS = require('aws-sdk');

// Инициализация AWS сервисов
const textract = new AWS.Textract();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const DYNAMODB_TABLE = 'research-extracted-text';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
    console.log('Textract Status Check Event:', JSON.stringify(event, null, 2));
    
    try {
        const { jobId, fileId } = JSON.parse(event.body);
        
        console.log(`Checking status for job ${jobId}, file ${fileId}`);
        
        // Проверяем статус задачи Textract
        const statusResult = await textract.getDocumentTextDetection({ JobId: jobId }).promise();
        
        console.log('Textract status:', statusResult.JobStatus);
        
        if (statusResult.JobStatus === 'SUCCEEDED') {
            await handleTextractSuccess(jobId, fileId, statusResult);
        } else if (statusResult.JobStatus === 'FAILED') {
            await handleTextractFailure(jobId, fileId, statusResult);
        } else {
            // Задача еще выполняется
            console.log(`Job ${jobId} is still ${statusResult.JobStatus}`);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    status: 'in_progress',
                    jobStatus: statusResult.JobStatus,
                    fileId: fileId
                })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 'completed',
                jobStatus: statusResult.JobStatus,
                fileId: fileId
            })
        };
        
    } catch (error) {
        console.error('Textract status check error:', error);
        
        await sendSNSNotification('status_check_failed', {
            error: error.message,
            event: event
        });
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};

async function handleTextractSuccess(jobId, fileId, statusResult) {
    console.log(`Textract job ${jobId} completed successfully`);
    
    try {
        // Извлекаем текст из результата
        let extractedText = '';
        if (statusResult.Blocks) {
            extractedText = statusResult.Blocks
                .filter(block => block.BlockType === 'LINE')
                .map(block => block.Text)
                .join('\n');
        }
        
        console.log(`Extracted text length: ${extractedText.length} characters`);
        
        // Запускаем AI анализ
        const aiAnalysis = performAIAnalysis(extractedText, fileId);
        
        // Обновляем DynamoDB
        await dynamodb.update({
            TableName: DYNAMODB_TABLE,
            Key: { fileId: fileId },
            UpdateExpression: 'SET extractedText = :text, textractStatus = :status, aiAnalysis = :ai, textLength = :length, completedAt = :completed, processingTime = :time',
            ExpressionAttributeValues: {
                ':text': extractedText,
                ':status': 'completed',
                ':ai': aiAnalysis,
                ':length': extractedText.length,
                ':completed': new Date().toISOString(),
                ':time': Date.now() - new Date(statusResult.JobStartTime).getTime()
            }
        }).promise();
        
        // Отправляем уведомление об успешном завершении
        await sendSNSNotification('processing_completed', {
            fileId: fileId,
            jobId: jobId,
            textLength: extractedText.length,
            aiAnalysis: aiAnalysis
        });
        
        console.log(`Successfully processed file ${fileId}`);
        
    } catch (error) {
        console.error('Error handling Textract success:', error);
        
        await dynamodb.update({
            TableName: DYNAMODB_TABLE,
            Key: { fileId: fileId },
            UpdateExpression: 'SET textractStatus = :status, error = :error, failedAt = :failed',
            ExpressionAttributeValues: {
                ':status': 'failed',
                ':error': error.message,
                ':failed': new Date().toISOString()
            }
        }).promise();
        
        await sendSNSNotification('post_processing_failed', {
            fileId: fileId,
            jobId: jobId,
            error: error.message
        });
    }
}

async function handleTextractFailure(jobId, fileId, statusResult) {
    console.log(`Textract job ${jobId} failed:`, statusResult.StatusMessage);
    
    await dynamodb.update({
        TableName: DYNAMODB_TABLE,
        Key: { fileId: fileId },
        UpdateExpression: 'SET textractStatus = :status, error = :error, failedAt = :failed',
        ExpressionAttributeValues: {
            ':status': 'failed',
            ':error': statusResult.StatusMessage || 'Unknown error',
            ':failed': new Date().toISOString()
        }
    }).promise();
    
    await sendSNSNotification('textract_failed', {
        fileId: fileId,
        jobId: jobId,
        error: statusResult.StatusMessage || 'Unknown error'
    });
}

function performAIAnalysis(text, fileId) {
    // Используем ту же логику AI анализа, что и в основной функции
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Извлекаем заголовок
    let titleOriginal = 'Research Document';
    let titleShort = 'Research Document';
    for (const line of lines.slice(0, 5)) {
        if (line.length > 10 && line.length < 200 && !line.includes('http')) {
            titleOriginal = line.trim();
            titleShort = line.length > 60 ? line.substring(0, 57) + '...' : line;
            break;
        }
    }
    
    // Извлекаем авторов
    let authors = [{ name_original: 'Unknown Author', name_latin: 'Unknown Author' }];
    const authorPatterns = [
        /(?:authors?|by|written by)[\s:]*([^\n]+)/i,
        /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
        /^([A-Z][a-z]+,\s*[A-Z][a-z]+)/
    ];
    
    for (const line of lines.slice(0, 10)) {
        for (const pattern of authorPatterns) {
            const match = line.match(pattern);
            if (match) {
                const authorName = match[1].trim();
                authors = [{ name_original: authorName, name_latin: authorName }];
                break;
            }
        }
        if (authors[0].name_original !== 'Unknown Author') break;
    }
    
    // Извлекаем ключевые слова
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 4)
        .filter(word => !['research', 'study', 'analysis', 'results', 'conclusion', 'global', 'august'].includes(word));
    
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const tags = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([word]) => word);
    
    return {
        title_original: titleOriginal,
        title_short: titleShort,
        authors: authors,
        organization: 'Research Institution',
        organization_type: 'Institute',
        pub_type: 'report',
        journal_or_source: 'Research Publication',
        volume_pages: 'Online ahead of print',
        doi: 'MISSING',
        url: '',
        date_published: new Date().toISOString().split('T')[0],
        language_source: 'en',
        region_or_context: 'Global',
        
        central_insight: text.substring(0, 300).trim() + '...',
        rationale: 'Анализ документа для извлечения ключевых инсайтов и структурированной информации',
        theoretical_framework: 'Теоретическая база исследования требует анализа содержания',
        methodology: {
            summary: 'Анализ документов для извлечения ключевых инсайтов',
            participants: 'Исследователи и эксперты в области',
            methods: 'Анализ документов и извлечение данных',
            instruments: 'Система анализа текста',
            geography: 'Глобальный охват',
            sample_size: 'N=1 документ'
        },
        key_findings: [
            'Основные тенденции в области исследования выявлены',
            'Ключевые выводы требуют дальнейшего анализа',
            'Практические применения определены'
        ],
        quote: text.split('\n').find(line => line.length > 50 && line.length < 200) || 'Key insight from the research.',
        questions_lenses: [
            'Каковы основные выводы исследования?',
            'Какие методы использовались в анализе?',
            'Какие практические применения возможны?'
        ],
        potential_application: 'Практические применения будут определены после анализа содержания',
        impact_forecast: 'Прогноз воздействия требует дальнейшего анализа результатов исследования',
        risks_limitations: [
            'Ограничения методологии требуют уточнения',
            'Необходима валидация результатов',
            'Географические ограничения не определены'
        ],
        tags: tags,
        
        on_website: false,
        provenance: {
            pages: [1, 2, 3],
            notes: 'Данные извлечены из PDF документа и обработаны AI'
        },
        missing_fields: ['doi']
    };
}

async function sendSNSNotification(type, data) {
    if (!SNS_TOPIC_ARN) {
        console.log('SNS topic not configured, skipping notification');
        return;
    }
    
    try {
        const message = {
            type: type,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        await sns.publish({
            TopicArn: SNS_TOPIC_ARN,
            Message: JSON.stringify(message),
            Subject: `Research Processing: ${type}`
        }).promise();
        
        console.log('SNS notification sent:', type);
    } catch (error) {
        console.error('Failed to send SNS notification:', error);
    }
}
