'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CategoryDetail } from '../_lib/actions';

type Props = {
  categories: CategoryDetail[];
  onEdit: (category: CategoryDetail) => void;
  onDelete: (category: CategoryDetail) => void;
};

export function CategoriesTable({ categories, onEdit, onDelete }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">カテゴリ一覧</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            カテゴリがありません
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>カテゴリ名</TableHead>
                <TableHead className="text-right">表示順</TableHead>
                <TableHead className="text-right">割り当て数</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Badge variant="outline">{category.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {category.displayOrder}
                  </TableCell>
                  <TableCell className="text-right">
                    {category.sourceCount}件
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(category)}
                        disabled={category.sourceCount > 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
