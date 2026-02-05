"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CardTypeOption = {
  id: string;
  code: string;
  name: string;
};

type Props = {
  cardTypes: CardTypeOption[];
  selectedCardTypeId: string;
  onCardTypeChange: (cardTypeId: string) => void;
  disabled?: boolean;
};

export function CardTypeFilter({ cardTypes, selectedCardTypeId, onCardTypeChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">カード種別:</span>
      <Select value={selectedCardTypeId} onValueChange={onCardTypeChange} disabled={disabled}>
        <SelectTrigger className="w-[260px]">
          <SelectValue placeholder="カード種別" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべてのカード</SelectItem>
          {cardTypes.map((ct) => (
            <SelectItem key={ct.id} value={ct.id}>
              {ct.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
