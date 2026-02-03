"use client";

import { useCallback, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type CategoryDetail, createCategory, deleteCategory, getCategories, updateCategory } from "../_lib/actions";
import type { CategoryFormInput } from "../_lib/schemas";
import { CategoriesTable } from "./categories-table";
import { CategoryForm } from "./category-form";

type Props = {
  initialCategories: CategoryDetail[];
};

export function CategoriesView({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDetail | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshCategories = useCallback(async () => {
    const newCategories = await getCategories();
    setCategories(newCategories);
  }, []);

  const handleAdd = useCallback(() => {
    setEditTarget(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((category: CategoryDetail) => {
    setEditTarget(category);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((category: CategoryDetail) => {
    setDeleteTarget(category);
  }, []);

  const handleFormSubmit = useCallback(
    (data: CategoryFormInput) => {
      startTransition(async () => {
        let result;
        if (editTarget) {
          result = await updateCategory(editTarget.id, data.name, data.displayOrder);
        } else {
          result = await createCategory(data.name, data.displayOrder);
        }

        if (result.success) {
          toast.success(result.message);
          setIsFormOpen(false);
          setEditTarget(null);
          await refreshCategories();
        } else {
          toast.error(result.message);
        }
      });
    },
    [editTarget, refreshCategories]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteCategory(deleteTarget.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteTarget(null);
        await refreshCategories();
      } else {
        toast.error(result.message);
      }
    });
  }, [deleteTarget, refreshCategories]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          カテゴリ追加
        </Button>
      </div>

      <CategoriesTable categories={categories} onEdit={handleEdit} onDelete={handleDelete} />

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={isPending}
        editTarget={editTarget}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリの削除</DialogTitle>
            <DialogDescription>カテゴリ「{deleteTarget?.name}」を削除しますか？</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isPending}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isPending}>
              {isPending ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
