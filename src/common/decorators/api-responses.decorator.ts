import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

export function ApiOkResponse(description: string, type?: any) {
  return applyDecorators(
    ApiResponse({ status: 200, description, type })
  );
}

export function ApiCreatedResponse(description: string, type?: any) {
  return applyDecorators(
    ApiResponse({ status: 201, description, type })
  );
}

export function ApiNoContentResponse(description: string) {
  return applyDecorators(
    ApiResponse({ status: 204, description })
  );
}

export function ApiBadRequestResponse() {
  return applyDecorators(
    ApiResponse({ 
      status: 400, 
      description: 'Bad Request', 
      type: ErrorResponseDto 
    })
  );
}

export function ApiNotFoundResponse() {
  return applyDecorators(
    ApiResponse({ 
      status: 404, 
      description: 'Not Found', 
      type: ErrorResponseDto 
    })
  );
}

export function ApiConflictResponse() {
  return applyDecorators(
    ApiResponse({ 
      status: 409, 
      description: 'Conflict', 
      type: ErrorResponseDto 
    })
  );
}

export function ApiUnprocessableEntityResponse() {
  return applyDecorators(
    ApiResponse({ 
      status: 422, 
      description: 'Unprocessable Entity', 
      type: ErrorResponseDto 
    })
  );
}

export function ApiStandardResponses() {
  return applyDecorators(
    ApiBadRequestResponse(),
    ApiNotFoundResponse(),
    ApiConflictResponse()
  );
}

export function ApiStandardResponsesWithUnprocessable() {
  return applyDecorators(
    ApiBadRequestResponse(),
    ApiNotFoundResponse(),
    ApiConflictResponse(),
    ApiUnprocessableEntityResponse()
  );
}
