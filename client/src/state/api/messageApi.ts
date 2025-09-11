import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "../types";
import { Chat, Message } from "@/types/prismaTypes";
import { baseQueryWithAuth } from "@/constants/baseQueryWithAuth";

export const messageApi = createApi({
  baseQuery: baseQueryWithAuth,
  reducerPath: "messageApi",
  tagTypes: ["Messages", "Chat"],
  endpoints: (builder) => ({
    // CREATE CHAT
    createChat: builder.mutation<
      ApiResponse<Chat>,
      { propertyId: number; userId: string }
    >({
      query: (data) => ({
        url: "/chat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Messages"],
    }),
    // FETCH ALL CHAT
    fetchAllChat: builder.query<Chat[], void>({
      query: () => "/chat",
      providesTags: ["Chat"],
    }),

    // send message
    sendMessage: builder.mutation<
      ApiResponse<Message>,
      { chatId: number; content: string }
    >({
      query: (data) => ({
        url: "/message",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Messages"],
    }),

    // GET CHAT MESSAGEs
    getAllMessages: builder.query<ApiResponse<Message[]>, string>({
      query: (chatId) => `/message/${chatId}`,
      providesTags: (result, error, id) => [
        { type: "Messages", id },
        "Messages",
      ],
    }),
  }),
});

export const {
  useCreateChatMutation,
  useFetchAllChatQuery,
  useSendMessageMutation,
  useGetAllMessagesQuery,
} = messageApi;
