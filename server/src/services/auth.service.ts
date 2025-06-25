import { Role } from "@prisma/client";
import prisma from "../prismaClient";
import {
  CreateAccount,
  forgotPassword,
  LoginUser,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
  verifyResendCode,
} from "../types/auth.types";
import { compareValue, hashPassword } from "../utils/bcrypt";
import { generateVerificationCode } from "../utils/generateVerificationCode";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/verificationEmail";
import jwt from "jsonwebtoken";
import appAssert from "../utils/appAssert";
import {
  BAD_REQUEST,
  CONFLICT,
  INTRENAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUEST,
  UNAUTHORIZED,
} from "../constants/httpStatus";

const MAX_SESSIONS = 5;

export const createAccount = async (data: CreateAccount) => {
  // verify existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  appAssert(!existingUser, CONFLICT, "Email already in use");

  //   hash password
  const hashedPassword = await hashPassword(data.password, 12);
  // if user doesnt exist, create a new user

  const roleMap = {
    Tenant: Role.TENANT,
    Landlord: Role.MANAGER,
  } as const;

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: roleMap[data.role],
    },
  });
  // create a verification code
  const code = generateVerificationCode();
  // send verification code to user
  await prisma.otp.create({
    data: {
      userId: user.id,
      code: code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    },
  });

  // send verification code
  await sendVerificationEmail(data.email, code);

  // create session
  const activeSessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
  });

  if (activeSessions.length >= MAX_SESSIONS) {
    const sessionsToDelete = activeSessions.slice(
      0,
      activeSessions.length - MAX_SESSIONS + 1
    );
    const deleteIds = sessionsToDelete.map((s) => s.id);
    await prisma.session.deleteMany({
      where: { id: { in: deleteIds } },
    });
  }

  // sign refresh token
  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "15d", audience: roleMap[data.role] }
  );
  // sign access token
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "20m", audience: roleMap[data.role] }
  );

  // 9. Store new session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // return user & access tokens
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const Login = async (data: LoginUser) => {
  // verify the user and password inputs
  const { email, password } = data;

  // using appAssert to ensure email and password is provided
  appAssert(email && password, BAD_REQUEST, "Email and password are required");

  // find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  // using appAsset to send error message amd ensure user exists
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  // compare password
  const isPasswordMatch = await compareValue(password, user.password);
  //use assert to throw an error if password does not match
  appAssert(isPasswordMatch, UNAUTHORIZED, "Invalid email or password");

  // create a session
  const activeSessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
  });

  if (activeSessions.length >= MAX_SESSIONS) {
    const sessionsToDelete = activeSessions.slice(
      0,
      activeSessions.length - MAX_SESSIONS + 1
    );
    const deleteIds = sessionsToDelete.map((s) => s.id);
    await prisma.session.deleteMany({
      where: { id: { in: deleteIds } },
    });
  }

  // sign refresh token
  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "15d" }
  );
  // sign access token
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "20m" }
  );

  // 9. Store new session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // return user & access tokens
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const verifyEmailService = async (data: verifyEmail) => {
  const { code } = data;
  // get the vrification code
  const validCode = await prisma.otp.findFirst({
    where: { code, expiresAt: { gt: new Date() } },
  });

  // send an error if the code is not valid or expired
  appAssert(validCode, BAD_REQUEST, "Invalid or expired verification code");

  // updaate the user email verified status
  const updateUser = await prisma.user.update({
    where: { id: validCode.userId },
    data: { emailVerified: true },
  });
  // send an assert message  if service failed
  appAssert(updateUser, INTRENAL_SERVER_ERROR, "Failed to verify Email");
  // delete the verification code and return user
  await prisma.otp.deleteMany({ where: { userId: validCode.userId } });

  return {
    user: {
      id: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
      role: updateUser.role,
    },
    message: "Email verified successfully",
  };
};

export const resendVerificationEmailService = async (
  data: resendVerificationEmail
) => {
  // destructure the data
  const { email } = data;
  // find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // assert an error if theres no user
  appAssert(user, BAD_REQUEST, "User not found");
  // ASSERT AN EROR if the email has already been verified before
  appAssert(!user.emailVerified, CONFLICT, "Email already verified");

  // delete existing otp for the user
  await prisma.otp.deleteMany({ where: { userId: user.id } });

  // generate a new code
  const code = generateVerificationCode();

  // create a new code in the database
  await prisma.otp.create({
    data: {
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    },
  });

  // return the user and send a verification email
  await sendVerificationEmail(email, code);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    message: "Verification Email sent successfully",
  };
};

export const forgotPasswordService = async (data: forgotPassword) => {
  // destructure the edata and get the email
  const { email } = data;
  // find the user by mail
  const user = await prisma.user.findUnique({ where: { email } });
  // assert an error if the user does not existassert an error if there is no user with that mail
  appAssert(user, NOT_FOUND, "User with this email doesn't exist");

  // CREATE a rate limit for the user
  const count = await prisma.otp.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000),
      },
    },
  });
  // assert an error if the user has exceeded rate limit
  appAssert(
    count <= 1,
    TOO_MANY_REQUEST,
    "Too many requests, please try again later"
  );

  // generate a code for the user
  const otp = generateVerificationCode();
  // create an expiry for the new code
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // CREATE AN OTP in the database
  await prisma.otp.create({
    data: {
      userId: user.id,
      code: otp,
      expiresAt,
      createdAt: new Date(),
    },
  });

  // send the vrification code to the user
  await sendPasswordResetEmail(email, otp);

  // retturn a response
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    message: "Password reset code sent to your email",
  };
};

export const resetPasswordService = async (data: resetPassword) => {
  const { email, code, newPassword, confirmPassword } = data;
  // find the user by email
  const user = await prisma.user.findUnique({ where: { email } });
  // assert an error if there is no user found
  appAssert(user, NOT_FOUND, "User with this email doesn't exist");
  // FIND THE OTP CODE
  const validOtp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  // assset an error if the code has expired or it is invalid
  appAssert(validOtp, BAD_REQUEST, "Invalid or expired reset code");

  // hash the new password
  const hashedPassword = await hashPassword(newPassword, 12);
  // update the user password in the database
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // delete all otp code for the user
  await prisma.otp.deleteMany({
    where: { userId: user.id },
  });

  // return a response
  return {
    message: "Password reset successful",
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    },
  };
};

export const verifyResetCodeService = async (data: verifyResendCode) => {
  // destructure the data
  const { email, code } = data;
  // get the user by email
  const user = await prisma.user.findUnique({ where: { email } });
  appAssert(user, NOT_FOUND, "User with this email doesn't exist");
  // send an otp code to the user
  const otp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  appAssert(otp, BAD_REQUEST, "Invalid or expired code");

  return {
    message: "Reset code verified. You can now reset your password.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};
