export type valueOf<T> = T[keyof T];

// ダッシュボード用データ型
export type DashboardData = {
  currentMonth: {
    yearMonth: string;
    totalAmount: number;
    paymentCount: number;
  } | null;
  previousMonth: {
    yearMonth: string;
    totalAmount: number;
    paymentCount: number;
  } | null;
  recentImports: {
    id: string;
    fileName: string;
    yearMonth: string;
    importedAt: Date;
    paymentCount: number;
  }[];
  topSources: {
    sourceName: string;
    totalAmount: number;
  }[];
  categoryBreakdown: {
    categoryName: string;
    totalAmount: number;
  }[];
};

// カード種別選択肢
export type CardTypeOption = {
  id: string;
  code: string;
  name: string;
};
