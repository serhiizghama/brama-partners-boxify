import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'The number of items to return', example: 20 }),
    ApiQuery({ name: 'offset', required: false, type: Number, description: 'The number of items to skip', example: 0 })
  );
}

export function ApiSearchQuery() {
  return applyDecorators(
    ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering' })
  );
}

export function ApiSortQuery(fields: string[]) {
  return applyDecorators(
    ApiQuery({ name: 'sort_by', required: false, enum: fields, description: 'The field to sort by' }),
    ApiQuery({ name: 'direction', required: false, enum: ['asc', 'desc'], description: 'The sort direction' })
  );
}

export function ApiStandardListQuery(fields: string[]) {
  return applyDecorators(
    ApiPaginationQuery(),
    ApiSearchQuery(),
    ApiSortQuery(fields)
  );
}

export function ApiBoxListQuery() {
  return applyDecorators(
    ApiPaginationQuery(),
    ApiSearchQuery(),
    ApiQuery({ name: 'status', required: false, enum: ['CREATED', 'SEALED', 'SHIPPED'], description: 'Filter by box status' }),
    ApiSortQuery(['label', 'status', 'created_at', 'updated_at'])
  );
}
