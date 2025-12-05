import { type Request, type Response } from 'express';

import { TAuthConfig } from '@/configs/auth.config';

export function fromCookie(req: Request) {
  return req.cookies?.authToken || null;
}

export function fromAuthHeaderAsBearerToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [bearer, token] = authHeader.split(' ');
    if (bearer == 'Bearer' && token) {
      return token;
    }
  }

  return null;
}

export type TFromExtractor = (req: Request) => string | null;

/**
 * Creates an extractor function that combines multiple extractor functions. Return the first token found.
 * @param extractors The extractor functions to use to extract the token.
 * @returns The first extractor function that returns a token.
 */
export function fromExtractors(extractors: TFromExtractor[]) {
  // edge case
  if (!Array.isArray(extractors)) {
    throw new TypeError('fromExtractors expects an array');
  }

  return function (req: Request) {
    let token: string | null = null;

    for (const extractor of extractors) {
      token = extractor(req);
      if (token) break;
    }

    return token;
  };
}
export function setAuthCookie(res: Response, token: string, authConfig: TAuthConfig) {
  res.cookie(authConfig.cookie.name, token, {
    httpOnly: true,
    path: '/',
    maxAge: authConfig.cookie.maxAge,
    secure: false,
    sameSite: 'lax',
  });
}
