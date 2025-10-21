import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidStatusTransitionException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message,
        error: 'Invalid Status Transition',
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
