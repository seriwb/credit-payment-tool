"use client";

import { useCallback, useState, useTransition } from "react";
import { CardTypeFilter } from "@/components/shared/card-type-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CardTypeOption } from "@/types/application";
import {
  type CategoryData,
  type MonthlyData,
  type SourceData,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getSourceAnalytics,
  getYearMonthRange,
} from "../_lib/actions";
import { CategoryChart } from "./category-chart";
import { MonthlyChart } from "./monthly-chart";
import { SourceChart } from "./source-chart";

type Props = {
  initialMonthlyData: MonthlyData[];
  initialSourceData: SourceData[];
  initialCategoryData: CategoryData[];
  yearMonths: string[];
  cardTypes: CardTypeOption[];
};

export function AnalyticsView({
  initialMonthlyData,
  initialSourceData,
  initialCategoryData,
  yearMonths: initialYearMonths,
  cardTypes,
}: Props) {
  const [monthlyData, setMonthlyData] = useState(initialMonthlyData);
  const [sourceData, setSourceData] = useState(initialSourceData);
  const [categoryData, setCategoryData] = useState(initialCategoryData);
  const [yearMonths, setYearMonths] = useState(initialYearMonths);
  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");
  const [selectedCardTypeId, setSelectedCardTypeId] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const formatYearMonth = (yearMonth: string) => {
    return `${yearMonth.slice(0, 4)}年${yearMonth.slice(4, 6)}月`;
  };

  const fetchData = useCallback((start: string, end: string, cardTypeId: string) => {
    startTransition(async () => {
      const startYM = start || undefined;
      const endYM = end || undefined;
      const ctId = cardTypeId === "all" ? undefined : cardTypeId;

      const [monthly, source, category, ymRange] = await Promise.all([
        getMonthlyAnalytics(startYM, endYM, ctId),
        getSourceAnalytics(startYM, endYM, 10, ctId),
        getCategoryAnalytics(startYM, endYM, ctId),
        getYearMonthRange(ctId),
      ]);

      setMonthlyData(monthly);
      setSourceData(source);
      setCategoryData(category);
      setYearMonths(ymRange.all);
    });
  }, []);

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

  // 集計サマリー
  const totalAmount = monthlyData.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalCount = monthlyData.reduce((sum, item) => sum + item.paymentCount, 0);
  const avgAmount = monthlyData.length > 0 ? totalAmount / monthlyData.length : 0;

  return (
    <div className="space-y-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">合計金額</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">支払い件数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount.toLocaleString()}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">月平均</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">¥{Math.round(avgAmount).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <MonthlyChart data={monthlyData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SourceChart data={sourceData} startMonth={startMonth} endMonth={endMonth} />
        <CategoryChart data={categoryData} />
      </div>
    </div>
  );
}
