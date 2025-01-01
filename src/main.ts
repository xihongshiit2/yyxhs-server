import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerModule } from './common/logger/logger.module';
import { AppLogger } from './common/logger/logger.service';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 不使用默认的 NestJS 日志器
    logger: false,
  });
  app.setGlobalPrefix('/v1/api');
  // 获取自定义日志器
  const logger = app.select(LoggerModule).get(AppLogger);
  app.useLogger(logger);

  // 使用 Helmet 增强安全性
  app.use(helmet());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const config = new DocumentBuilder()
    .setTitle('yyxhs API')
    .setDescription('API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
