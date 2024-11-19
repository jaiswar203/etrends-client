import { HTTP_REQUEST } from "@/contants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";
import { OrderDetailInputs } from "@/types/order";
import { clientApi } from "./client";

const orderUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders`;

export type CreateOrderRequest = OrderDetailInputs & { client_id: string };

export interface IFirstOrderObject {
  products: string[];
  base_cost: number;
  amc_rate: {
    percentage: number;
    amount: number;
  };
  status: string;
  payment_terms: {
    name: string;
    percentage_from_base_cost: number;
    calculated_amount: number;
    date: string;
  }[];
  agreement_date: {
    start: Date;
    end: Date;
  };
  agreement_document: string;
  purchase_order_document: string;
  other_document: string;
  deployment_date: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  license: {
    rate: {
      percentage: number;
      amount: number;
    };
    _id: string;
    product_id: string;
    total_license: number;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
  customization: {
    _id: string;
    product_id: string;
    cost: number;
    amc_rate: {
      percentage: number;
      amount: number;
    };
    modules: string[];
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
  training_implementation_cost: number;
  _id: string;
}

export interface IFirstOrderResponse extends IResponse {
  data: IFirstOrderObject;
}

export type IUpdateOrderRequest = OrderDetailInputs & { orderId: string };

export const orderApi = createApi({
  reducerPath: "order",
  baseQuery: fetchBaseQuery({
    baseUrl: orderUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["FIRST_ORDER_DATA"],
  endpoints: (builder) => ({
    getFirstOrderById: builder.query<IFirstOrderResponse, string>({
      query: (clientId) => `/first/${clientId}`,
      providesTags: ["FIRST_ORDER_DATA"],
    }),
    createOrder: builder.mutation<IResponse, CreateOrderRequest>({
      query: (body: CreateOrderRequest) => ({
        url: `/first/${body.client_id}`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        await queryFulfilled;
        dispatch(
          clientApi.util.invalidateTags(["CLIENT_LIST", "CLIENT_DETAIL"])
        );
      },
    }),
    updateFirstOrder: builder.mutation<IResponse, IUpdateOrderRequest>({
      query: (body: IUpdateOrderRequest) => ({
        url: `/first/${body.orderId}`,
        method: HTTP_REQUEST.PATCH,
        body,
      }),
      invalidatesTags: ["FIRST_ORDER_DATA"],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        await queryFulfilled;
        dispatch(
          clientApi.util.invalidateTags(["CLIENT_LIST", "CLIENT_DETAIL"])
        );
      },
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetFirstOrderByIdQuery,
  useUpdateFirstOrderMutation,
} = orderApi;
