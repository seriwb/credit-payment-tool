'use client';

import { useState, useCallback, useTransition } from 'react';
import { SourcesTable } from './sources-table';
import {
  getPaymentSources,
  type PaymentSourceDetail,
  type CategoryOption,
} from '../_lib/actions';

type Props = {
  initialSources: PaymentSourceDetail[];
  categories: CategoryOption[];
};

export function SourcesView({ initialSources, categories }: Props) {
  const [sources, setSources] = useState(initialSources);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      const newSources = await getPaymentSources();
      setSources(newSources);
    });
  }, []);

  return (
    <div className="space-y-6">
      {isPending && (
        <div className="text-sm text-muted-foreground">更新中...</div>
      )}
      <SourcesTable
        sources={sources}
        categories={categories}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
