import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = res;
    const now = Date.now();

    // 隐藏敏感信息，如密码
    // const safeBody = { ...body };
    // if (safeBody.password) {
    //   safeBody.password = '******';
    // }

    // 记录请求的详细信息
    this.logger.log(
      `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)} - Params: ${JSON.stringify(params)}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const { statusCode } = res;
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${statusCode} - ${delay}ms`, 'HTTP');
      }),
    );
  }
}
