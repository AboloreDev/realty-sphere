import { CookieOptions, Response } from "express";

// checking if the environment is development or production
// If it's development, cookies will not be secure, otherwise they will be
// secure in production to ensure security best practices.

const defaults: CookieOptions = {
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: new Date(Date.now() + 9 * 60 * 60 * 1000),
});

const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
});

// Interface for the parameters required to set authentication cookies
// It includes the response object and the access and refresh tokens
export interface SetAuthCookiesParams {
  res: Response;
  accessToken: string;
  refreshToken: string;
}

// Setting the cookies for authentication
export const setAuthCookies = ({
  res,
  accessToken,
  refreshToken,
}: SetAuthCookiesParams) => {
  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};
