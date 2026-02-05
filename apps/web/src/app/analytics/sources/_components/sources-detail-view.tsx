"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CardTypeFilter } from "@/components/card-type-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CardTypeOption } from "@/types/application";
import { type SourceData, getSourceAnalytics, getYearMonthRange } from "../../_lib/actions";
import { SourcesChart } from "./sources-chart";
import { SourcesTable } from "./sources-table";

type Props = {
  initialData: SourceData[];
  yearMonths: string[];
  initialStartMonth?: string;
  initialEndMonth?: string;
  cardTypes: CardTypeOption[];
};

export function SourcesDetailView({
  initialData,
  yearMonths: initialYearMonths,
  initialStartMonth,
  initialEndMonth,
  cardTypes,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [yearMonths, setYearMonths] = useState(initialYearMonths);
  const [startMonth, setStartMonth] = useState<string>(initialStartMonth ?? "");
  const [endMonth, setEndMonth] = useState<string>(initialEndMonth ?? "");
  const [selectedCardTypeId, setSelectedCardTypeId] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const formatYearMonth = (yearMonth: string) => {
    return `${yearMonth.slice(0, 4)}年${yearMonth.slice(4, 6)}月`;
  };

  const updateUrl = useCallback(
    (start: string, end: string) => {
      const params = new URLSearchParams();
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      const query = params.toString();
      router.push(`/analytics/sources${query ? `?${query}` : ""}`);
    },
    [router]
  );

  const fetchData = useCallback(
    (start: string, end: string, cardTypeId: string) => {
      startTransition(async () => {
        const startYM = start || undefined;
        const endYM = end || undefined;
        const ctId = cardTypeId === "all" ? undefined : cardTypeId;

        const [sourceData, ymRange] = await Promise.all([
          getSourceAnalytics(startYM, endYM, 10000, ctId),
          getYearMonthRange(ctId),
        ]);
        setData(sourceData);
        setYearMonths(ymRange.all);
        updateUrl(start, end);
      });
    },
    [updateUrl]
  );

  const handleStartChange = useCallback(
    (value: string) => {
      const newStart = value === "all" ? "" : value;
      setStartMonth(newStart);
      fetchData(newStart, endMonth, selectedCardTypeId);
    },
    [endMonth, selectedCardTypeId, fetchData]
  );

  const handleEndChange = useCallback(
    (value: string) => {
      const newEnd = value === "all" ? "" : value;
      setEndMonth(newEnd);
      fetchData(startMonth, newEnd, selectedCardTypeId);
    },
    [startMonth, selectedCardTypeId, fetchData]
  );

  const handleCardTypeChange = useCallback(
    (cardTypeId: string) => {
      setSelectedCardTypeId(cardTypeId);
      fetchData(startMonth, endMonth, cardTypeId);
    },
    [startMonth, endMonth, fetchData]
  );

  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.paymentCount, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/analytics"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        分析ページに戻る
      </Link>

      <div className="flex items-center gap-4">
        <CardTypeFilter
          cardTypes={cardTypes}
          selectedCardTypeId={selectedCardTypeId}
          onCardTypeChange={handleCardTypeChange}
          disabled={isPending}
        />
        {isPending && <span className="text-sm text-muted-foreground">読み込み中...</span>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">期間選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">開始:</span>
              <Select value={startMonth || "all"} onValueChange={handleStartChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="指定なし" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">指定なし</SelectItem>
                  {yearMonths.map((ym) => (
                    <SelectItem key={ym} value={ym}>
                      {formatYearMonth(ym)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-muted-foreground">〜</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">終了:</span>
              <Select value={endMonth || "all"} onValueChange={handleEndChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="指定なし" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">指定なし</SelectItem>
                  {yearMonths.map((ym) => (
                    <SelectItem key={ym} value={ym}>
                      {formatYearMonth(ym)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">支払い元数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.length.toLocaleString()}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">合計金額</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">合計件数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount.toLocaleString()}回</p>
          </CardContent>
        </Card>
      </div>

      <SourcesChart data={data} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">支払い元一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <SourcesTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
