import { TMeVo } from '@peernest/contract';
import { TSelectableRole, TSelectableUser } from '@peernest/db';
import { type Request, type Response } from 'express';

import { authConfig } from '@/configs/auth.config';
import { getFullStorageUrl } from '@/features/attachment/utils';

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
export function setAuthCookie(res: Response, token: string) {
  res.cookie(authConfig().cookie.name, token, {
    httpOnly: true,
    path: '/',
    maxAge: authConfig().cookie.maxAge,
    secure: false,
    sameSite: 'lax',
  });
}

export function pickUserMe(user: TSelectableUser & TSelectableRole): TMeVo {
  return {
    displayName: user.userDisplayName,
    role: user.roleName,
    email: user.userEmail,
    avatarUrl: getFullStorageUrl(user.userAvatarUrl),
    lastSignedTime: user.userLastSignedTime,
  };
}
