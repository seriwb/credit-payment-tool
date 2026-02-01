'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/component';

type Props = {
  onFilesSelected: (files: File[]) => void;
  isUploading: boolean;
};

export function FileUploadZone({ onFilesSelected, isUploading }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.name.endsWith('.csv')
    );
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...selectedFiles]);
      e.target.value = '';
    },
    []
  );

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(() => {
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [files, onFilesSelected]);

  const handleClear = useCallback(() => {
    setFiles([]);
  }, []);

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
          isDragging && 'border-primary bg-primary/5',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <CardContent className="p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center gap-4"
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                CSVファイルをドラッグ＆ドロップ
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                または
              </p>
            </div>
            <label>
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                asChild
              >
                <span className="cursor-pointer">ファイルを選択</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              ファイル名形式: YYYYMM.csv または YYYYMM-num.csv
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  選択済みファイル ({files.length}件)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={isUploading}
                >
                  クリア
                </Button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? 'インポート中...' : 'インポート実行'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
