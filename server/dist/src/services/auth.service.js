"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmailService = exports.verifyEmailService = exports.Login = exports.createAccount = void 0;
const client_1 = require("@prisma/client");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const bcrypt_1 = require("../utils/bcrypt");
const generateVerificationCode_1 = require("../utils/generateVerificationCode");
const verificationEmail_1 = require("../utils/verificationEmail");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const httpStatus_1 = require("../constants/httpStatus");
const MAX_SESSIONS = 5;
const createAccount = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // verify existing user
    const existingUser = yield prismaClient_1.default.user.findUnique({
        where: { email: data.email },
    });
    (0, appAssert_1.default)(!existingUser, httpStatus_1.CONFLICT, "Email already in use");
    //   hash password
    const hashedPassword = yield (0, bcrypt_1.hashPassword)(data.password, 12);
    // if user doesnt exist, create a new user
    const roleMap = {
        Tenant: client_1.Role.TENANT,
        Landlord: client_1.Role.MANAGER,
    };
    const user = yield prismaClient_1.default.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: roleMap[data.role],
        },
    });
    // create a verification code
    const code = (0, generateVerificationCode_1.generateVerificationCode)();
    // send verification code to user
    yield prismaClient_1.default.otp.create({
        data: {
            userId: user.id,
            code: code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });
    // send verification code
    yield (0, verificationEmail_1.sendVerificationEmail)(data.email, code);
    // create session
    const activeSessions = yield prismaClient_1.default.session.findMany({
        where: {
            userId: user.id,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "asc" },
    });
    if (activeSessions.length >= MAX_SESSIONS) {
        const sessionsToDelete = activeSessions.slice(0, activeSessions.length - MAX_SESSIONS + 1);
        const deleteIds = sessionsToDelete.map((s) => s.id);
        yield prismaClient_1.default.session.deleteMany({
            where: { id: { in: deleteIds } },
        });
    }
    // sign refresh token
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "15d", audience: roleMap[data.role] });
    // sign access token
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "20m", audience: roleMap[data.role] });
    // 9. Store new session
    yield prismaClient_1.default.session.create({
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
});
exports.createAccount = createAccount;
const Login = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // verify the user and password inputs
    const { email, password } = data;
    // using appAssert to ensure email and password is provided
    (0, appAssert_1.default)(email && password, httpStatus_1.BAD_REQUEST, "Email and password are required");
    // find the user by email
    const user = yield prismaClient_1.default.user.findUnique({
        where: { email },
    });
    // using appAsset to send error message amd ensure user exists
    (0, appAssert_1.default)(user, httpStatus_1.UNAUTHORIZED, "Invalid email or password");
    // compare password
    const isPasswordMatch = yield (0, bcrypt_1.compareValue)(password, user.password);
    //use assert to throw an error if password does not match
    (0, appAssert_1.default)(isPasswordMatch, httpStatus_1.UNAUTHORIZED, "Invalid email or password");
    // create a session
    const activeSessions = yield prismaClient_1.default.session.findMany({
        where: {
            userId: user.id,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "asc" },
    });
    if (activeSessions.length >= MAX_SESSIONS) {
        const sessionsToDelete = activeSessions.slice(0, activeSessions.length - MAX_SESSIONS + 1);
        const deleteIds = sessionsToDelete.map((s) => s.id);
        yield prismaClient_1.default.session.deleteMany({
            where: { id: { in: deleteIds } },
        });
    }
    // sign refresh token
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "15d" });
    // sign access token
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "20m" });
    // 9. Store new session
    yield prismaClient_1.default.session.create({
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
});
exports.Login = Login;
const verifyEmailService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = data;
    // get the vrification code
    const validCode = yield prismaClient_1.default.otp.findFirst({
        where: { code, expiresAt: { gt: new Date() } },
    });
    // send an error if the code is not valid or expired
    (0, appAssert_1.default)(validCode, httpStatus_1.BAD_REQUEST, "Invalid or expired verification code");
    // updaate the user email verified status
    const updateUser = yield prismaClient_1.default.user.update({
        where: { id: validCode.userId },
        data: { emailVerified: true },
    });
    // send an assert message  if service failed
    (0, appAssert_1.default)(updateUser, httpStatus_1.INTRENAL_SERVER_ERROR, "Failed to verify Email");
    // delete the verification code and return user
    yield prismaClient_1.default.otp.deleteMany({ where: { userId: validCode.userId } });
    return {
        user: {
            id: updateUser.id,
            name: updateUser.name,
            email: updateUser.email,
            role: updateUser.role,
        },
        message: "Email verified successfully",
    };
});
exports.verifyEmailService = verifyEmailService;
const resendVerificationEmailService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // destructure the data
    const { email } = data;
    // find the user
    const user = yield prismaClient_1.default.user.findUnique({
        where: { email },
    });
    // assert an error if theres no user
    (0, appAssert_1.default)(user, httpStatus_1.BAD_REQUEST, "User not found");
    // ASSERT AN EROR if the email has already been verified before
    (0, appAssert_1.default)(!user.emailVerified, httpStatus_1.CONFLICT, "Email already verified");
    // delete existing otp for the user
    yield prismaClient_1.default.otp.deleteMany({ where: { userId: user.id } });
    // generate a new code
    const code = (0, generateVerificationCode_1.generateVerificationCode)();
    // create a new code in the database
    yield prismaClient_1.default.otp.create({
        data: {
            userId: user.id,
            code,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
    });
    // return the user and send a verification email
    yield (0, verificationEmail_1.sendVerificationEmail)(email, code);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        message: "Verification Email sent successfully",
    };
});
exports.resendVerificationEmailService = resendVerificationEmailService;
