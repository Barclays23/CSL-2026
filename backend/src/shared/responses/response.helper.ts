import type { IPagination } from "../types/common.types.js";
import type { IApiResponse } from "./response.types.js";

export class ApiResponse<TData> implements IApiResponse<TData> {
  private constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly data?: TData,
    public readonly pagination?: IPagination,
  ) {}

  public static success<TData>(
    message: string,
    data?: TData,
    pagination?: IPagination,
  ): ApiResponse<TData> {
    return new ApiResponse<TData>(true, message, data, pagination);
  }

  public static error<TData>(message: string, data?: TData): ApiResponse<TData> {
    return new ApiResponse<TData>(false, message, data);
  }
}
