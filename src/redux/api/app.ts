import { HTTP_REQUEST } from "@/contants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";

const appUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export const appApi = createApi({
  reducerPath: "app",
  baseQuery: fetchBaseQuery({
    baseUrl: appUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUrlForUpload: builder.mutation<IResponse, string>({
      query: (filename: string) => ({
        url: `/url-for-upload`,
        method: HTTP_REQUEST.POST,
        body: {
          filename,
        },
      }),
    }),
  }),
});

export const { useGetUrlForUploadMutation } = appApi;
