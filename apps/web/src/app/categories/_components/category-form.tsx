'use client';

import { useEffect } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryFormSchema, type CategoryFormInput } from '../_lib/schemas';
import type { CategoryDetail } from '../_lib/actions';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormInput) => void;
  isLoading: boolean;
  editTarget: CategoryDetail | null;
};

// フォームの入力値型（displayOrderは文字列として扱う）
type FormValues = {
  name: string;
  displayOrder: string;
};

export function CategoryForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editTarget,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (open) {
      if (editTarget) {
        reset({
          name: editTarget.name,
          displayOrder: String(editTarget.displayOrder),
        });
      } else {
        reset({
          name: '',
          displayOrder: '0',
        });
      }
    }
  }, [open, editTarget, reset]);

  const handleFormSubmit = (data: FormValues) => {
    // バリデーション
    const parsed = categoryFormSchema.safeParse({
      name: data.name,
      displayOrder: data.displayOrder,
    });

    if (parsed.success) {
      onSubmit(parsed.data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editTarget ? 'カテゴリ編集' : 'カテゴリ追加'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">カテゴリ名</Label>
            <Input
              id="name"
              {...register('name', { required: 'カテゴリ名を入力してください' })}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayOrder">表示順</Label>
            <Input
              id="displayOrder"
              type="number"
              {...register('displayOrder', {
                required: '表示順を入力してください',
                min: { value: 0, message: '表示順は0以上の整数を入力してください' },
              })}
              disabled={isLoading}
            />
            {errors.displayOrder && (
              <p className="text-sm text-destructive">
                {errors.displayOrder.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
