import { ScimContentTypeInterceptor } from './scim-content-type.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ScimContentTypeInterceptor', () => {
  let interceptor: ScimContentTypeInterceptor;

  beforeEach(() => {
    interceptor = new ScimContentTypeInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should set Content-Type header to application/scim+json', (done) => {
      const mockSetHeader = jest.fn();
      const mockResponse = {
        headersSent: false,
        setHeader: mockSetHeader,
      };

      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ id: 'test-user', userName: 'test@example.com' }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockSetHeader).toHaveBeenCalledWith(
            'Content-Type',
            'application/scim+json; charset=utf-8'
          );
        },
        complete: () => done(),
      });
    });

    it('should not set header if response already sent', (done) => {
      const mockSetHeader = jest.fn();
      const mockResponse = {
        headersSent: true, // Headers already sent
        setHeader: mockSetHeader,
      };

      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ id: 'test-user' }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockSetHeader).not.toHaveBeenCalled();
        },
        complete: () => done(),
      });
    });

    it('should pass through the response data unchanged', (done) => {
      const mockResponse = {
        headersSent: false,
        setHeader: jest.fn(),
      };

      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const expectedData = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: 'user-123',
        userName: 'test@example.com',
        active: true,
      };

      const mockCallHandler: CallHandler = {
        handle: () => of(expectedData),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedData);
        },
        complete: () => done(),
      });
    });

    it('should work with list responses', (done) => {
      const mockSetHeader = jest.fn();
      const mockResponse = {
        headersSent: false,
        setHeader: mockSetHeader,
      };

      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const listResponse = {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 2,
        startIndex: 1,
        itemsPerPage: 2,
        Resources: [
          { id: 'user-1', userName: 'user1@example.com' },
          { id: 'user-2', userName: 'user2@example.com' },
        ],
      };

      const mockCallHandler: CallHandler = {
        handle: () => of(listResponse),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual(listResponse);
          expect(mockSetHeader).toHaveBeenCalledWith(
            'Content-Type',
            'application/scim+json; charset=utf-8'
          );
        },
        complete: () => done(),
      });
    });

    it('should work with error responses', (done) => {
      const mockSetHeader = jest.fn();
      const mockResponse = {
        headersSent: false,
        setHeader: mockSetHeader,
      };

      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const errorResponse = {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        status: '404',
        detail: 'User not found',
      };

      const mockCallHandler: CallHandler = {
        handle: () => of(errorResponse),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual(errorResponse);
          expect(mockSetHeader).toHaveBeenCalledWith(
            'Content-Type',
            'application/scim+json; charset=utf-8'
          );
        },
        complete: () => done(),
      });
    });
  });
});
