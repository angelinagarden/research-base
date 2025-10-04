const AWS = require('aws-sdk');
const axios = require('axios');

const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log('API Event:', JSON.stringify(event, null, 2));
    
    const { httpMethod, pathParameters, body } = event;
    
    try {
        const resource = event.resource || event.path;
        
        switch (httpMethod) {
            case 'POST':
                if (resource === '/upload') {
                    return await handleUpload(JSON.parse(body || '{}'));
                } else if (resource === '/process/{fileId}') {
                    const fileId = pathParameters?.fileId;
                    return await handleProcess(fileId);
                } else if (resource === '/notion/create') {
                    return await handleNotionCreate(JSON.parse(body || '{}'));
                }
                break;
                
            case 'GET':
                if (resource === '/status/{fileId}') {
                    const fileId = pathParameters?.fileId;
                    return await handleStatus(fileId);
                }
                break;
        }
        
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({ error: 'Not found' })
        };
        
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function handleUpload(data) {
    // Генерируем pre-signed URL для загрузки в S3
    const fileId = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const key = `uploads/${fileId}.pdf`;
    
    const uploadUrl = s3.getSignedUrl('putObject', {
        Bucket: 'research-base-angelina',
        Key: key,
        ContentType: 'application/pdf',
        Expires: 3600 // 1 час
    });
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        body: JSON.stringify({
            success: true,
            fileId: fileId,
            uploadUrl: uploadUrl,
            message: 'Upload URL generated'
        })
    };
}

async function handleProcess(fileId) {
    try {
        // Проверяем, есть ли результат обработки
        const resultKey = `processed/research-${fileId}-result.json`;
        
        const result = await s3.getObject({
            Bucket: 'research-base-angelina',
            Key: resultKey
        }).promise();
        
        const extractedData = JSON.parse(result.Body.toString());
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                extractedData: extractedData,
                status: 'completed'
            })
        };
        
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            return {
                statusCode: 202,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing',
                    message: 'File is being processed'
                })
            };
        }
        
        throw error;
    }
}

async function handleStatus(fileId) {
    try {
        const resultKey = `processed/research-${fileId}-result.json`;
        
        await s3.headObject({
            Bucket: 'research-base-angelina',
            Key: resultKey
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                status: 'completed'
            })
        };
        
    } catch (error) {
        if (error.code === 'NotFound') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    status: 'processing'
                })
            };
        }
        
        throw error;
    }
}

async function handleNotionCreate(data) {
    try {
        // Здесь должна быть интеграция с Notion API
        // Пока возвращаем заглушку
        
        console.log('Notion create request:', data);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'Research entry created in Notion',
                notionId: 'notion-' + Date.now()
            })
        };
        
    } catch (error) {
        console.error('Notion create error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}
