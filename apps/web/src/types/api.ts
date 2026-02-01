//----- for API -----
export type ApiResult<T = undefined> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export type OffsetPaginator<T> = {
  rows: T[];
  offset: number;
  total: number;
};
