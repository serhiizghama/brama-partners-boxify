import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ProductEntity } from '../../domain/products/entities/product.entity';
import { BoxEntity } from '../../domain/boxes/entities/box.entity';
import { ErrorResponseDto } from '../dto/error-response.dto';

// Product responses
export function ApiProductResponses() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'The product.', type: ProductEntity }),
    ApiResponse({ status: 201, description: 'The product has been successfully created.', type: ProductEntity }),
    ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto }),
    ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto }),
    ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto })
  );
}

export function ApiProductListResponse() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'A list of products.', type: [ProductEntity] })
  );
}

// Box responses
export function ApiBoxResponses() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'The box.', type: BoxEntity }),
    ApiResponse({ status: 201, description: 'The box has been successfully created.', type: BoxEntity }),
    ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto }),
    ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto }),
    ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto }),
    ApiResponse({ status: 422, description: 'Invalid Status Transition', type: ErrorResponseDto })
  );
}

export function ApiBoxListResponse() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'A list of boxes.', type: [BoxEntity] })
  );
}

export function ApiBoxProductOperationsResponse() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'The updated box.', type: BoxEntity }),
    ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto }),
    ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponseDto }),
    ApiResponse({ status: 409, description: 'Conflict', type: ErrorResponseDto }),
    ApiResponse({ status: 422, description: 'Invalid Status Transition', type: ErrorResponseDto })
  );
}
