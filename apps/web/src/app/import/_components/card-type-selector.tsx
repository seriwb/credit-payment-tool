"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CardTypeOption } from "@/types/application";

type Props = {
  cardTypes: CardTypeOption[];
  selectedCode: string;
  onCodeChange: (code: string) => void;
  disabled?: boolean;
};

export function CardTypeSelector({ cardTypes, selectedCode, onCodeChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">カード種別:</span>
      <Select value={selectedCode} onValueChange={onCodeChange} disabled={disabled}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="カード種別を選択" />
        </SelectTrigger>
        <SelectContent>
          {cardTypes.map((ct) => (
            <SelectItem key={ct.code} value={ct.code}>
              {ct.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
