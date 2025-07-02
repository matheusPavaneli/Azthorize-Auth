// src/@types/express/index.d.ts
import { IPayload } from 'src/common/interfaces/IPayload';

declare module 'express' {
  interface Request {
    user?: IPayload;
  }
}
