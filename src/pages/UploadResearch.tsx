import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { researchWorkflowService, WorkflowProgress } from '@/services/researchWorkflowService';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  error?: string;
}

const UploadResearch: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadStatus({
        status: 'idle',
        progress: 0,
        message: `Выбран файл: ${selectedFile.name}`
      });
    } else {
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: 'Пожалуйста, выберите PDF файл',
        error: 'Неподдерживаемый формат файла'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus({
      status: 'uploading',
      progress: 0,
      message: 'Начинаем обработку файла...'
    });

    try {
      // Создаем сервис с callback для обновления прогресса
      const { ResearchWorkflowService } = await import('@/services/researchWorkflowService');
      const workflowService = new ResearchWorkflowService(
        (progress: WorkflowProgress) => {
          setUploadStatus({
            status: progress.stage === 'error' ? 'error' : 
                   progress.stage === 'completed' ? 'success' :
                   progress.stage === 'notion' ? 'processing' :
                   'uploading',
            progress: progress.progress,
            message: progress.message
          });
        }
      );

      // Запускаем полный workflow
      const result = await workflowService.processResearchPDF(file);

      if (result.success) {
        setUploadStatus({
          status: 'success',
          progress: 100,
          message: 'Исследование успешно добавлено в Notion и Google Drive!'
        });
      } else {
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: 'Ошибка при обработке файла',
          error: result.error || 'Неизвестная ошибка'
        });
      }

    } catch (error) {
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: 'Ошибка при загрузке файла',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus.status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Загрузка исследования
            </CardTitle>
            <CardDescription>
              Загрузите PDF файл исследования. Он будет автоматически обработан через AWS, 
              добавлен в Notion базу данных и сохранен в Google Drive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Выбор файла */}
            <div className="space-y-2">
              <Label htmlFor="pdf-file">PDF файл исследования</Label>
              <Input
                ref={fileInputRef}
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {/* Статус загрузки */}
            {uploadStatus.message && (
              <div className="space-y-3">
                <Alert>
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <AlertDescription className={getStatusColor()}>
                      {uploadStatus.message}
                    </AlertDescription>
                  </div>
                </Alert>
                
                {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') && (
                  <Progress value={uploadStatus.progress} className="w-full" />
                )}
              </div>
            )}

            {/* Ошибка */}
            {uploadStatus.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadStatus.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Кнопки */}
            <div className="flex gap-3">
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'}
                className="flex-1"
              >
                {(uploadStatus.status === 'uploading' || uploadStatus.status === 'processing') ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Загрузить исследование
                  </>
                )}
              </Button>
              
              {uploadStatus.status === 'success' && (
                <Button variant="outline" onClick={resetForm}>
                  Загрузить еще
                </Button>
              )}
            </div>

            {/* Информация о процессе */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Что происходит при загрузке:</h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Файл загружается в AWS S3</li>
                <li>2. AWS обрабатывает PDF и извлекает данные</li>
                <li>3. Данные автоматически добавляются в Notion базу</li>
                <li>4. Файл сохраняется в Google Drive</li>
                <li>5. Вы получаете уведомление об успешном завершении</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadResearch;
