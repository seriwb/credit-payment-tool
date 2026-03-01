"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ImportHistory } from "../_lib/types";

type Props = {
  history: ImportHistory[];
  onDelete: (id: string) => Promise<void>;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatYearMonth = (yearMonth: string) => {
  return `${yearMonth.slice(0, 4)}年${yearMonth.slice(4, 6)}月`;
};

export function ImportHistoryTable({ history, onDelete }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<ImportHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    await onDelete(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">インポート履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">インポート履歴がありません</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ファイル名</TableHead>
                  <TableHead>カード種別</TableHead>
                  <TableHead>対象年月</TableHead>
                  <TableHead className="text-right">件数</TableHead>
                  <TableHead>インポート日時</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.fileName}</TableCell>
                    <TableCell className="text-sm">{item.cardTypeName}</TableCell>
                    <TableCell>{formatYearMonth(item.yearMonth)}</TableCell>
                    <TableCell className="text-right">{`${item.paymentCount.toLocaleString()}件`}</TableCell>
                    <TableCell>{formatDate(item.importedAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>インポートデータの削除</DialogTitle>
            <DialogDescription>
              {deleteTarget?.fileName} のインポートデータを削除しますか？ 関連する支払いデータもすべて削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
