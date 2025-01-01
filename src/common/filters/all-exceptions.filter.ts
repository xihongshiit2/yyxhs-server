import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppLogger } from '../logger/logger.service';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = '内部服务器错误';
    let serCode: number | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        if ('message' in exceptionResponse) {
          message = exceptionResponse['message'];
        } else {
          message = JSON.stringify(exceptionResponse);
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errrResponse: ApiResponse<null> = {
      statusCode: status,
      message: message,
      data: null,
      serCode: serCode,
    };

    // 记录详细错误信息，包括堆栈
    if (exception instanceof Error) {
      this.logger.error(
        `Method: ${request.method}, URL: ${request.url}, Parameters: ${JSON.stringify(request.params)}, Query: ${JSON.stringify(request.query)}, Body: ${JSON.stringify(request.body)}`,
        exception.stack,
        'ExceptionFilter',
      );
    } else {
      this.logger.error(
        `Method: ${request.method}, URL: ${request.url}, Parameters: ${JSON.stringify(request.params)}, Query: ${JSON.stringify(request.query)}, Body: ${JSON.stringify(request.body)}`,
        JSON.stringify(exception),
        'ExceptionFilter',
      );
    }
    response.status(status).json(errrResponse);
  }
}
