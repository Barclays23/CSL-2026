export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
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
