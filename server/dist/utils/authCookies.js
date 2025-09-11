"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookies = void 0;
// checking if the environment is development or production
// If it's development, cookies will not be secure, otherwise they will be
// secure in production to ensure security best practices.
const isProd = process.env.NODE_ENV === "production";
const defaults = {
    sameSite: isProd ? "none" : "lax",
    httpOnly: true,
    secure: isProd,
};
const getAccessTokenCookieOptions = () => (Object.assign(Object.assign({}, defaults), { expires: new Date(Date.now() + 9 * 60 * 60 * 1000) }));
const getRefreshTokenCookieOptions = () => (Object.assign(Object.assign({}, defaults), { expires: new Date(Date.now() + 9 * 60 * 60 * 1000) }));
// Setting the cookies for authentication
const setAuthCookies = ({ res, accessToken, refreshToken, }) => {
    res
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};
exports.setAuthCookies = setAuthCookies;
