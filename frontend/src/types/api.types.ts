export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type Pagination = IPagination;

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data?: TData;
  pagination?: IPagination;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  fieldErrors?: Record<string, string>;
}

export interface Asset {
  url: string;
  publicId: string;
}

export type Ref<T extends { _id: string }> = string | T;
