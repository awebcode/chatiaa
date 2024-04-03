/// <reference types="next" />
/// <reference types="next/image-types/global" />
// next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string;
    refreshToken: string;
  }
}
// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
