import { CREATED, OK } from "../constants/httpStatus";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyResetCodeSchema,
} from "../schema/auth.schema";
import {
  createAccount,
  forgotPasswordService,
  Login,
  resendVerificationEmailService,
  resetPasswordService,
  verifyEmailService,
  verifyResetCodeService,
} from "../services/auth.service";
import { setAuthCookies } from "../utils/authCookies";
import { catchAsyncError } from "../utils/catchAsyncErrors";

export const registerUser = catchAsyncError(async (req, res) => {
  // validate the request
  const request = registerSchema.parse(req.body);

  //  use the service
  const { user, accessToken, refreshToken } = await createAccount(request);

  // set cookies and return the response
  setAuthCookies({ res, accessToken, refreshToken });
  return res.status(CREATED).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
  });
});
export const loginUser = catchAsyncError(async (req, res) => {
  // validate the request
  const request = loginSchema.parse(req.body);

  // use the service
  const { user, accessToken, refreshToken } = await Login(request);

  //set the cookies and rey=turn the response
  setAuthCookies({ res, accessToken, refreshToken });
  return res.status(OK).json({
    success: true,
    message: "User Logged in successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const verifyEmail = catchAsyncError(async (req, res) => {
  // validate the request
  const verification: any = verifyEmailSchema.parse(req.params.code);

  // use the service
  const { user, message } = await verifyEmailService(verification);
  // return the response
  return res.status(OK).json({
    success: true,
    message,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const resendVerificationMail = catchAsyncError(async (req, res) => {
  // validate the request
  const request = resendVerificationSchema.parse(req.body);
  // use the service
  const { user, message } = await resendVerificationEmailService(request);
  // return the response
  return res.status(OK).json({
    success: true,
    message,
    user,
  });
});
export const forgotPassword = catchAsyncError(async (req, res) => {
  // validate the request
  const request = forgotPasswordSchema.parse(req.body);
  // use the srvice

  const { user, message } = await forgotPasswordService(request);

  // return a response
  return res.status(OK).json({
    success: true,
    message,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
export const resetPassword = catchAsyncError(async (req, res) => {
  // validate the request
  const request = resetPasswordSchema.parse(req.body);

  // use the service
  const { user, message } = await resetPasswordService(request);
  // return a response

  // first define the cokies options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  // clear the cookies (access and refresh token)
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", {
    ...cookieOptions,
    path: "/auth/refresh",
  });

  // return the response
  return res.status(OK).json({
    succes: true,
    message,
    user,
  });
});
export const verifyResetPasswordCode = catchAsyncError(async (req, res) => {
  // validate the request
  const request = verifyResetCodeSchema.parse(req.body);

  // use the service
  const { user, message } = await verifyResetCodeService(request);
  // return a response
  return res.status(OK).json({
    succes: true,
    message,
    user,
  });
});

export const logout = catchAsyncError(async (req, res) => {
  const accessToken = req.cookies.accessToken;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  // No token? Clear both cookies anyway
  if (!accessToken) {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", {
      ...cookieOptions,
    });
    return res.status(OK).json({
      success: true,
      message: "User logged out successfully",
    });
  }

  try {
    // Clear both cookies with full options
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", {
      ...cookieOptions,
    });

    return res.status(OK).json({
      success: true,
      message: "User logged out from all devices",
    });
  } catch (error) {
    // On error, still clear both
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", {
      ...cookieOptions,
    });

    return res.status(OK).json({
      success: true,
      message: "Invalid token. Cookies cleared.",
    });
  }
});
