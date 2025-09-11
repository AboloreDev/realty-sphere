"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookies = void 0;
// checking if the environment is development or production
// If it's development, cookies will not be secure, otherwise they will be
// secure in production to ensure security best practices.
const secure = process.env.NODE_ENV !== "development";
// Default cookie options
// These options will be applied to both accessToken and refreshToken cookies
// SameSite is set to "strict" to prevent CSRF attacks, httpOnly is set to true to prevent client-side scripts from accessing the cookies, and secure is set based on the environment
const defaults = {
    sameSite: "none",
    httpOnly: true,
    secure,
};
const getAccessTokenCookieOptions = () => (Object.assign(Object.assign({}, defaults), { expires: new Date(Date.now() + 2 * 60 * 60 * 1000) }));
const getRefreshTokenCookieOptions = () => (Object.assign(Object.assign({}, defaults), { expires: new Date(Date.now() + 2 * 60 * 60 * 1000) }));
// Setting the cookies for authentication
const setAuthCookies = ({ res, accessToken, refreshToken, }) => {
    res
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};
exports.setAuthCookies = setAuthCookies;
