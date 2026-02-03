"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteImportedFile, getImportHistory, importCsvFile, importFromDirectory } from "../_lib/actions";
import type { ImportHistory, ImportResult } from "../_lib/types";
import { DirectoryInput } from "./directory-input";
import { FileUploadZone } from "./file-upload-zone";
import { ImportHistoryTable } from "./import-history-table";

type Props = {
  initialHistory: ImportHistory[];
};

export function ImportView({ initialHistory }: Props) {
  const [history, setHistory] = useState<ImportHistory[]>(initialHistory);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const refreshHistory = useCallback(async () => {
    const newHistory = await getImportHistory();
    setHistory(newHistory);
  }, []);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      startTransition(async () => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const importResults = await importCsvFile(formData);
        setResults(importResults);

        const successCount = importResults.filter((r) => r.success).length;
        const failCount = importResults.filter((r) => !r.success).length;

        if (successCount > 0) {
          toast.success(`${successCount}件のファイルをインポートしました`);
          await refreshHistory();
        }
        if (failCount > 0) {
          toast.error(`${failCount}件のファイルでエラーが発生しました`);
        }
      });
    },
    [refreshHistory]
  );

  const handleDirectoryImport = useCallback(
    (path: string) => {
      startTransition(async () => {
        const importResults = await importFromDirectory(path);
        setResults(importResults);

        const successCount = importResults.filter((r) => r.success).length;
        const failCount = importResults.filter((r) => !r.success).length;

        if (successCount > 0) {
          toast.success(`${successCount}件のファイルをインポートしました`);
          await refreshHistory();
        }
        if (failCount > 0) {
          toast.error(`${failCount}件のファイルでエラーが発生しました`);
        }
      });
    },
    [refreshHistory]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await deleteImportedFile(id);
      if (result.success) {
        toast.success(result.message);
        await refreshHistory();
      } else {
        toast.error(result.message);
      }
    },
    [refreshHistory]
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">ファイルアップロード</TabsTrigger>
          <TabsTrigger value="directory">ディレクトリ指定</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-4">
          <FileUploadZone onFilesSelected={handleFileUpload} isUploading={isPending} />
        </TabsContent>
        <TabsContent value="directory" className="mt-4">
          <DirectoryInput onSubmit={handleDirectoryImport} isLoading={isPending} />
        </TabsContent>
      </Tabs>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">インポート結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between rounded bg-muted px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "成功" : "エラー"}
                    </Badge>
                    <span className="font-mono text-sm">{result.fileName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.success && result.paymentCount !== undefined ? `${result.paymentCount}件` : result.message}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ImportHistoryTable history={history} onDelete={handleDelete} />
    </div>
  );
}
