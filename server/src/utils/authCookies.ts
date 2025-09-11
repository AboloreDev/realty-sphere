import { CookieOptions, Response } from "express";

// checking if the environment is development or production
// If it's development, cookies will not be secure, otherwise they will be
// secure in production to ensure security best practices.
const secure = process.env.NODE_ENV !== "development";

// Default cookie options
// These options will be applied to both accessToken and refreshToken cookies
// SameSite is set to "strict" to prevent CSRF attacks, httpOnly is set to true to prevent client-side scripts from accessing the cookies, and secure is set based on the environment
const defaults: CookieOptions = {
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
});

const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
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
