import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ValidationError } from 'class-validator';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      // Обработка HTTP исключений (включая наши кастомные)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name || 'Http Exception';
      } else {
        message = exception.message;
        error = exception.name || 'Http Exception';
      }
    } else if (exception instanceof QueryFailedError) {
      // Обработка ошибок TypeORM
      status = this.mapTypeOrmError(exception);
      message = this.getTypeOrmErrorMessage(exception);
      error = 'Database Error';
    } else if (exception instanceof ValidationError) {
      // Обработка ошибок валидации class-validator
      status = HttpStatus.BAD_REQUEST;
      message = this.formatValidationError(exception);
      error = 'Validation Error';
    } else if (exception instanceof Error) {
      // Обработка общих ошибок
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = 'Internal Server Error';
    } else {
      // Неизвестные ошибки
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Unknown Error';
    }

    // Логирование ошибки
    this.logger.error(
      `Exception caught: ${JSON.stringify({
        status,
        message,
        error,
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      })}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Отправка ответа
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapTypeOrmError(exception: QueryFailedError): number {
    const message = exception.message.toLowerCase();
    
    // Маппинг ошибок TypeORM на HTTP статусы
    if (message.includes('not found') || message.includes('does not exist')) {
      return HttpStatus.NOT_FOUND;
    }
    
    if (message.includes('duplicate') || message.includes('unique constraint')) {
      return HttpStatus.CONFLICT;
    }
    
    if (message.includes('foreign key') || message.includes('constraint')) {
      return HttpStatus.BAD_REQUEST;
    }
    
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getTypeOrmErrorMessage(exception: QueryFailedError): string {
    const message = exception.message;
    
    // Упрощение сообщений об ошибках TypeORM для пользователя
    if (message.includes('duplicate key')) {
      return 'Resource already exists';
    }
    
    if (message.includes('foreign key constraint')) {
      return 'Referenced resource does not exist';
    }
    
    if (message.includes('not null constraint')) {
      return 'Required field is missing';
    }
    
    return 'Database operation failed';
  }

  private formatValidationError(exception: ValidationError): string {
    const constraints = exception.constraints;
    if (constraints) {
      return Object.values(constraints).join(', ');
    }
    return 'Validation failed';
  }
}
