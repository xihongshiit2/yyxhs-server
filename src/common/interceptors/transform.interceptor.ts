import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        // 检查是否已经是 ApiResponse 格式
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }
        return {
          statusCode: statusCode,
          message: '请求成功',
          data: data || null,
          serCode: null, // 默认不设置服务状态码，可根据需要在具体逻辑中覆盖
        };
      }),
    );
  }
}
