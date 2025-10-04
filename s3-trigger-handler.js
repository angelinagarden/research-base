const { Client } = require('@notionhq/client');
const AWS = require('aws-sdk');

// Инициализация AWS сервисов
const s3 = new AWS.S3();
const textract = new AWS.Textract();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const S3_BUCKET = process.env.S3_BUCKET;
const DYNAMODB_TABLE = 'research-extracted-text';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
    console.log('S3 Trigger Event:', JSON.stringify(event, null, 2));
    
    try {
        for (const record of event.Records) {
            if (record.eventName.startsWith('ObjectCreated:')) {
                await processNewPDF(record.s3);
            }
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'S3 trigger processed successfully',
                processedRecords: event.Records.length
            })
        };
    } catch (error) {
        console.error('S3 trigger error:', error);
        
        // Отправляем уведомление об ошибке
        await sendSNSNotification('error', {
            error: error.message,
            event: event
        });
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                processedRecords: 0
            })
        };
    }
};

async function processNewPDF(s3Record) {
    const bucket = s3Record.bucket.name;
    const key = decodeURIComponent(s3Record.object.key.replace(/\+/g, ' '));
    
    console.log(`Processing new PDF: s3://${bucket}/${key}`);
    
    // Извлекаем fileId из ключа
    const fileId = extractFileIdFromKey(key);
    if (!fileId) {
        console.log('Could not extract fileId from key:', key);
        return;
    }
    
    try {
        // Отправляем уведомление о начале обработки
        await sendSNSNotification('processing_started', {
            fileId: fileId,
            bucket: bucket,
            key: key
        });
        
        // Проверяем, что это PDF файл
        if (!key.toLowerCase().endsWith('.pdf')) {
            console.log('File is not a PDF, skipping:', key);
            return;
        }
        
        // Запускаем асинхронную обработку Textract
        const jobId = await startAsyncTextractProcessing(bucket, key, fileId);
        
        console.log(`Started Textract job ${jobId} for file ${fileId}`);
        
        // Сохраняем информацию о запущенной задаче в DynamoDB
        await dynamodb.put({
            TableName: DYNAMODB_TABLE,
            Item: {
                fileId: fileId,
                s3Bucket: bucket,
                s3Key: key,
                textractJobId: jobId,
                textractStatus: 'processing',
                createdAt: new Date().toISOString(),
                processingStartedAt: new Date().toISOString()
            }
        }).promise();
        
        // Отправляем уведомление о запуске обработки
        await sendSNSNotification('textract_started', {
            fileId: fileId,
            jobId: jobId,
            bucket: bucket,
            key: key
        });
        
    } catch (error) {
        console.error('Error processing PDF:', error);
        
        // Сохраняем ошибку в DynamoDB
        await dynamodb.put({
            TableName: DYNAMODB_TABLE,
            Item: {
                fileId: fileId,
                s3Bucket: bucket,
                s3Key: key,
                textractStatus: 'failed',
                error: error.message,
                createdAt: new Date().toISOString(),
                failedAt: new Date().toISOString()
            }
        }).promise();
        
        // Отправляем уведомление об ошибке
        await sendSNSNotification('processing_failed', {
            fileId: fileId,
            error: error.message,
            bucket: bucket,
            key: key
        });
    }
}

async function startAsyncTextractProcessing(bucket, key, fileId) {
    const params = {
        DocumentLocation: {
            S3Object: {
                Bucket: bucket,
                Name: key
            }
        },
        ClientRequestToken: fileId, // Используем fileId как уникальный токен
        JobTag: fileId // Добавляем тег для идентификации
    };
    
    const result = await textract.startDocumentTextDetection(params).promise();
    return result.JobId;
}

function extractFileIdFromKey(key) {
    // Извлекаем fileId из пути типа: uploads/research-1759583354624-sf6dc8a.pdf
    const match = key.match(/uploads\/(research-[^\.]+)\.pdf/);
    return match ? match[1] : null;
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
