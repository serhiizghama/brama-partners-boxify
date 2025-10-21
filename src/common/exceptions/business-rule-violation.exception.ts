import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessRuleViolationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Business Rule Violation',
      },
      HttpStatus.CONFLICT,
    );
  }
}
