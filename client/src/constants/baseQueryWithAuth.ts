import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: "http://35.173.226.149",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Add Authorization header for mobile compatibility
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");
    return headers;
  },
});
