import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Response } from 'express';

/**
 * Interceptor to set the Content-Type header to 'application/scim+json' for all SCIM responses.
 * 
 * Per RFC 7644 Section 3.1:
 * "SCIM uses a media type of 'application/scim+json' to identify SCIM protocol resources."
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.1
 */
@Injectable()
export class ScimContentTypeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        // Only set if response hasn't been sent and is a JSON response
        if (!response.headersSent) {
          response.setHeader('Content-Type', 'application/scim+json; charset=utf-8');
        }
      })
    );
  }
}
