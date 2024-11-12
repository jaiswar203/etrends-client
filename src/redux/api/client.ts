import { ClientDetailsInputs } from "@/types/client";
import { HTTP_REQUEST } from "@/contants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";

const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/clients`;

export type IClientDataObject = ClientDetailsInputs & {
  _id: string;
  createdAt: string;
};

export interface IClientObject extends IResponse {
  data: IClientDataObject;
}

type IUpdateClientRequest = ClientDetailsInputs & { id: string };

export interface IClientsResponse extends IResponse {
  data: IClientDataObject[];
}

export const clientApi = createApi({
  reducerPath: "client",
  baseQuery: fetchBaseQuery({
    baseUrl: authUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["CLIENT_DETAIL", "CLIENT_LIST"],
  endpoints: (builder) => ({
    getClientById: builder.query<IClientObject, string>({
      query: (id) => `/${id}`,
      providesTags: ["CLIENT_DETAIL"],
    }),
    getClients: builder.query<
      IClientsResponse,
      { limit?: number; page?: number }
    >({
      query: ({ limit = 10, page = 1 } = {}) => `/?limit=${limit}&page=${page}`,
      providesTags: ["CLIENT_LIST"],
    }),
    addClient: builder.mutation<IResponse, ClientDetailsInputs>({
      query: (body: ClientDetailsInputs) => ({
        url: "/",
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: ["CLIENT_LIST"],
    }),
    updateClient: builder.mutation<IResponse, IUpdateClientRequest>({
      query: (body: IUpdateClientRequest) => ({
        url: `/${body.id}`,
        method: HTTP_REQUEST.PATCH,
        body,
      }),
      invalidatesTags: ["CLIENT_DETAIL", "CLIENT_LIST"],
    }),
  }),
});

export const {
  useAddClientMutation,
  useGetClientByIdQuery,
  useUpdateClientMutation,
  useGetClientsQuery,
} = clientApi;
