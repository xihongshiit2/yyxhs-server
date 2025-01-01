import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.logger = winston.createLogger({
      level: this.configService.get<string>('LOG_LEVEL') || 'info', // 可根据环境变量调整日志级别
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, optionalParams);
  }
  error(message: any, trace: string, ...optionalParams: any[]) {
    this.logger.error(`${message} -> ${trace}`, optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, optionalParams);
  }
  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, optionalParams);
  }
  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, optionalParams);
  }
}
