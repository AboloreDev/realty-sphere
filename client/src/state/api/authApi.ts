import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ApiResponse,
  AuthResponse,
  LoginUserTypes,
  RegisterUserTypes,
} from "../types";

export const authApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "authApi",
  tagTypes: ["register", "login"],
  endpoints: (builder) => ({
    registerUser: builder.mutation<AuthResponse, RegisterUserTypes>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    loginUser: builder.mutation<AuthResponse, LoginUserTypes>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation<ApiResponse<object>, { email: string }>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    verifyOtp: builder.mutation<
      ApiResponse<object>,
      { email: string; otp: string }
    >({
      query: (data) => ({
        url: "/auth/reset-password/verify",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation<
      ApiResponse<object>,
      {
        email: string;
        otp: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    // Authenticate the user
    getUserProfile: builder.query<AuthResponse, void>({
      query: () => "/user",
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useGetUserProfileQuery,
} = authApi;
