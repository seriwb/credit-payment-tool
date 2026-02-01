'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { directoryPathSchema, type DirectoryPathInput } from '../_lib/schemas';

type Props = {
  onSubmit: (path: string) => void;
  isLoading: boolean;
};

export function DirectoryInput({ onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DirectoryPathInput>({
    resolver: zodResolver(directoryPathSchema),
  });

  const handleFormSubmit = (data: DirectoryPathInput) => {
    onSubmit(data.path);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderOpen className="h-4 w-4" />
          ディレクトリからインポート
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="path">ディレクトリパス</Label>
            <Input
              id="path"
              placeholder="/path/to/csv/files"
              {...register('path')}
              disabled={isLoading}
            />
            {errors.path && (
              <p className="text-sm text-destructive">{errors.path.message}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            サーバー上のディレクトリパスを指定してください。
            ディレクトリ内のすべてのCSVファイルがインポートされます。
          </p>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'インポート中...' : 'インポート実行'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
