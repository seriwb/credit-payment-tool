'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  yearMonths: string[];
  selectedMonth: string;
  onMonthChange: (yearMonth: string) => void;
};

export function MonthSelector({ yearMonths, selectedMonth, onMonthChange }: Props) {
  const formatYearMonth = (yearMonth: string) => {
    return `${yearMonth.slice(0, 4)}年${yearMonth.slice(4, 6)}月`;
  };

  return (
    <Select value={selectedMonth} onValueChange={onMonthChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="年月を選択" />
      </SelectTrigger>
      <SelectContent>
        {yearMonths.map((ym) => (
          <SelectItem key={ym} value={ym}>
            {formatYearMonth(ym)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
