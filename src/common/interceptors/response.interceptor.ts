import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data: T) => {
        const ctx: HttpArgumentsHost = context.switchToHttp();
        const { statusCode = 500 } = ctx.getResponse<Response>();
        const { url } = ctx.getRequest<Request>();

        return {
          success: true,
          statusCode,
          path: url,
          message: 'Request sucessful',
          data,
        };
      }),
    );
  }
}
