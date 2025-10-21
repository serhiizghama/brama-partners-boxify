import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from '../../../src/common/filters/global-exception.filter';
import { BusinessRuleViolationException } from '../../../src/common/exceptions/business-rule-violation.exception';
import { InvalidStatusTransitionException } from '../../../src/common/exceptions/invalid-status-transition.exception';
import { QueryFailedError } from 'typeorm';

jest.mock('@nestjs/common', () => {
  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  class MockLoggerClass {
    constructor() {
      return mockLogger;
    }
    static overrideLogger = jest.fn();
  }

  return {
    ...jest.requireActual('@nestjs/common'),
    Logger: MockLoggerClass,
  };
});

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
      ],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }) as unknown as {
        getResponse: () => typeof mockResponse;
        getRequest: () => typeof mockRequest;
      },
    } as unknown as ArgumentsHost;
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test error',
        error: 'HttpException',
      }),
    );
  });

  it('should handle BusinessRuleViolationException correctly', () => {
    const exception = new BusinessRuleViolationException('Product already in box');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Product already in box',
        error: 'Business Rule Violation',
      }),
    );
  });

  it('should handle InvalidStatusTransitionException correctly', () => {
    const exception = new InvalidStatusTransitionException('Cannot transition from SHIPPED to CREATED');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Cannot transition from SHIPPED to CREATED',
        error: 'Invalid Status Transition',
      }),
    );
  });

  it('should handle QueryFailedError correctly', () => {
    const exception = new QueryFailedError<any>('SELECT * FROM non_existent_table', [], new Error('Query failed'));

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed',
        error: 'Database Error',
      }),
    );
  });

  it('should handle generic Error correctly', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Generic error',
        error: 'Internal Server Error',
      }),
    );
  });

  it('should handle unknown exceptions correctly', () => {
    const exception = 'String error';

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Unknown Error',
      }),
    );
  });
});