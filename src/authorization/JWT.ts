import { CookieOptions, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";

import { User } from "../entity/user";

const ACCESS_TOKEN = "overcast_access_token";
const REFRESH_TOKEN = "overcast_refresh_token";

/**
 * Create JWT for the `user`
 */
export const createJWT = (user: User) => {
  const accessToken = sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15min",
    }
  );

  const refreshToken = sign(
    { userId: user.id, count: user.count },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Create a new JWT for `user` and set as cookies
 */
export const setJWTCookie = (res: Response, user: User) => {
  const { accessToken, refreshToken } = createJWT(user);
  const cookieOptions: CookieOptions = {
    domain: process.env.COOKIE_DOMAIN,
    sameSite: "strict",
  };

  res.cookie(ACCESS_TOKEN, accessToken, {
    maxAge: 100 * 60 * 15,
    ...cookieOptions,
  });
  res.cookie(REFRESH_TOKEN, refreshToken, {
    maxAge: 100 * 60 * 60 * 24 * 7,
    ...cookieOptions,
  });
};

/**
 * Get JWT values from cookies
 */
export const getJWTCookie = (req: Request) => {
  const refreshToken = req.cookies[REFRESH_TOKEN];
  const accessToken = req.cookies[ACCESS_TOKEN];
  return { accessToken, refreshToken };
};

/**
 * Clear JWT from cookies
 */
export const clearJWTCookie = (res: Response) => {
  res.clearCookie(REFRESH_TOKEN);
  res.clearCookie(ACCESS_TOKEN);
};

/**
 * add `userId` data to `req` when there is a valid `accessToken`.
 * Also works when `refreshToken` is valid, in this case the tokens
 * will get replaced.
 */
export const JWTMiddleware = () => async (
  req: Request,
  res: Response,
  next: () => void
) => {
  if (!req.cookies) return next();

  const { accessToken, refreshToken } = getJWTCookie(req);
  if (!accessToken && !refreshToken) return next();

  if (accessToken) {
    try {
      const data = verify(accessToken, process.env.JWT_SECRET as string) as any;
      (req as any).userId = data.userId;
    } catch {}
    return next();
  }

  if (refreshToken) {
    let data: any;
    try {
      data = verify(refreshToken, process.env.JWT_SECRET as string);
    } catch {}
    // token has been invalidated
    if (!data) return next();

    const user = await User.getById(data.userId);

    // token has been invalidated
    if (!user || user.count !== data.count) return next();
    // refresh tokens
    setJWTCookie(res, user);
    req.userId = user.id;

    return next();
  }
};
