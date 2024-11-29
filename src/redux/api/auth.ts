import { HTTP_REQUEST } from "@/contants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/users`;

export interface IResponse<T = any> {
  message: string;
  data: T;
  success: boolean;
}

interface ILoginRequest {
  email: string;
  password: string;
}

interface ISignUpRequest {
  name: string;
  email: string;
  password: string;
  designation: string;
  img_url: string;
}

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: fetchBaseQuery({ baseUrl: authUrl }),
  endpoints: (builder) => ({
    loginUser: builder.mutation<IResponse, ILoginRequest>({
      query: ({ email, password }: ILoginRequest) => ({
        url: "/login",
        method: HTTP_REQUEST.POST,
        body: {
          email,
          password,
        },
      }),
    }),
    signUpUser: builder.mutation<IResponse, ISignUpRequest>({
      query: ({
        name,
        email,
        password,
        designation,
        img_url,
      }: ISignUpRequest) => ({
        url: "/",
        method: HTTP_REQUEST.POST,
        body: {
          name,
          email,
          password,
          designation,
          img_url,
        },
      }),
    }),
  }),
});

export const { useLoginUserMutation, useSignUpUserMutation } = authApi;
