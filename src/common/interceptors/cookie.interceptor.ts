import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    return next.handle().pipe(
      map(
        (data: {
          accessToken?: string;
          refreshToken?: string;
          message?: string;
        }) => {
          const path = req.path;

          if (path === '/user/update' && data?.accessToken) {
            res.cookie('access_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
            });
            delete data.accessToken;
          }

          if (
            path === '/auth/login' &&
            data?.refreshToken &&
            data?.accessToken
          ) {
            res.cookie('refresh_token', data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            delete data.refreshToken;
            res.cookie('access_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
            });
            delete data.accessToken;
          }
          if (
            path === '/auth/google/callback' &&
            data?.refreshToken &&
            data?.accessToken
          ) {
            res.cookie('refresh_token', data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            delete data.refreshToken;
            res.cookie('access_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
            });
            delete data.accessToken;
          }

          if (path === '/auth/refresh-access-token' && data?.accessToken) {
            res.cookie('access_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
            });
            delete data.accessToken;
          }

          if (path === '/2fa/activate' && data?.accessToken) {
            res.cookie('access_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
            });
            delete data.accessToken;
          }
          if (path === '/2fa/verify' && data?.accessToken) {
            res.cookie('access_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
            });
            delete data.accessToken;
          }
          if (path === '/2fa/verify-email-token' && data?.accessToken) {
            res.cookie('access_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 15 * 60 * 1000,
            });
            delete data.accessToken;
          }

          if (path === '/auth/logout') {
            res.clearCookie('refresh_token', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
            });
            res.clearCookie('access_token', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
            });
          }

          return data;
        },
      ),
    );
  }
}
