// CSVパース結果の型
export type ParsedPayment = {
  paymentDate: Date;
  sourceName: string;
  amount: number;
  quantity: number;
};

// CSVパース結果
export type CsvParseResult = {
  yearMonth: string;
  payments: ParsedPayment[];
  totalAmount: number;
};

// インポート結果
export type ImportResult = {
  success: boolean;
  fileName: string;
  message: string;
  paymentCount?: number;
  cardTypeName?: string;
};

// インポート履歴
export type ImportHistory = {
  id: string;
  fileName: string;
  yearMonth: string;
  importedAt: Date;
  paymentCount: number;
  cardTypeName: string;
};
