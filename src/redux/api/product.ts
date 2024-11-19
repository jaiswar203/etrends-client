import { HTTP_REQUEST } from "@/contants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";
import { IProduct } from "@/types/product";

const productUrl = `${process.env.NEXT_PUBLIC_API_URL}/products`;

interface IGetAllProductResponse extends IResponse {
  data: IProduct[];
}

export const productApi = createApi({
  reducerPath: "product",
  baseQuery: fetchBaseQuery({
    baseUrl: productUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getAllProducts: builder.query<IGetAllProductResponse, void>({
      query: () => ({
        url: "/",
        method: HTTP_REQUEST.GET,
      }),
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<IResponse, Omit<IProduct, "_id">>({
      query: (body) => ({
        url: "/",
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation<IResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: HTTP_REQUEST.DELETE,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
} = productApi;
