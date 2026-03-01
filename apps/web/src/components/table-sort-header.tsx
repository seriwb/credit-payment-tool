import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils/component";

export type SortOrder = "asc" | "desc";

type Props = {
  title: string;
  sortKey: string;
  currentSortKey: string;
  currentSortOrder: SortOrder;
  onSort: (key: string) => void;
  className?: string;
};

export const TableSortHeader = ({ title, sortKey, currentSortKey, currentSortOrder, onSort, className }: Props) => {
  const isActive = sortKey === currentSortKey;

  return (
    <button className={cn("flex items-center gap-1", className)} onClick={() => onSort(sortKey)}>
      {title}
      {isActive ? (
        currentSortOrder === "asc" ? (
          <ArrowUp className="size-4" />
        ) : (
          <ArrowDown className="size-4" />
        )
      ) : (
        <ArrowUpDown className="size-4 text-muted-foreground" />
      )}
    </button>
  );
};
