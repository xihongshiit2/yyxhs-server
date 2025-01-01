export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
  serCode?: number; // 可选服务状态码
}
