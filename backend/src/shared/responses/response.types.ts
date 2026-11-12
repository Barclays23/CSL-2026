export interface Pagination {
  page:number;
  limit:number;
  total:number;
  totalPages:number;
}
export interface ApiResponse<T> {
  success:true;
  message:string;
  data:T;
  pagination?:Pagination;
}
export interface ApiErrorResponse {
  success:false;
  message:string;
  errorCode?:string;
  fieldErrors?:Record<string,string>;
}
