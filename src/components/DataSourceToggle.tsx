import React from 'react';
import { Database, FileText } from 'lucide-react';

interface DataSourceToggleProps {
  useNotion: boolean;
  onToggle: (useNotion: boolean) => void;
  loading?: boolean;
}

const DataSourceToggle: React.FC<DataSourceToggleProps> = ({ 
  useNotion, 
  onToggle, 
  loading = false 
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <span className="text-sm font-mono text-muted-foreground">Источник данных:</span>
      
      <button
        onClick={() => onToggle(false)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-mono transition-colors ${
          !useNotion
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground hover:bg-accent'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <FileText className="w-4 h-4" />
        Локальные данные
      </button>
      
      <button
        onClick={() => onToggle(true)}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-mono transition-colors ${
          useNotion
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground hover:bg-accent'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Database className="w-4 h-4" />
        Notion
      </button>
    </div>
  );
};

export default DataSourceToggle;
