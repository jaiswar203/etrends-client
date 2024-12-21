import { HTTP_REQUEST } from "@/contants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";
import { CustomizationType, OrderDetailInputs } from "@/types/order";
import { clientApi, IClientDataObject } from "./client";
import { ILicenseInputs } from "@/components/Purchase/Form/LicenseForm";
import { IAdditionalServiceInputs } from "@/components/Purchase/Form/AdditionalServiceForm";
import { ICustomizationInputs } from "@/components/Purchase/Form/CustomizationForm";
import { IProduct } from "@/types/product";
import { IAmcInputs } from "@/components/AMC/AMCDetail";
import { AMC_FILTER } from "@/components/AMC/AMC";

const orderUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders`;

export type CreateOrderRequest = OrderDetailInputs & { client_id: string };

export interface ILicenceObject {
  rate: {
    percentage: number;
    amount: number;
  };
  _id: string;
  product_id: string;
  total_license: number;
  purchase_date: string;
  purchase_order_document: string;
  invoice: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomizationObject {
  _id: string;
  product_id: string;
  cost: number;
  modules: string[];
  reports: string[];
  purchase_order_document: string;
  purchased_date: string;
  invoice_document: string;
  type: CustomizationType;
  title?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAdditionalServiceObject {
  _id: string;
  product_id: string;
  name: string;
  date: {
    start: Date;
    end: Date;
  };
  cost: number;
  purchase_order_document?: string;
  invoice_document?: string;
  service_document?: string;
  order_id: string;
}

export interface IOrderObject {
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
  agreements: {
    start: Date;
    end: Date;
    document: string;
  }[];
  purchase_order_document: string;
  invoice_document: string;
  base_cost_seperation?: {
    product_id: string;
    amount: number;
    percentage: number;
  }[];
  other_document: {
    title: string;
    url: string;
  };
  amc_start_date: string;
  purchased_date: Date;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  license: ILicenceObject;
  customization: ICustomizationObject;
  customizations?: ICustomizationObject[];
  licenses?: ILicenceObject[];
  additional_services?: IAdditionalServiceObject[];
  _id: string;
}

export type IAMCFrequency = 1 | 3 | 6 | 12 | 18 | 24;

export type TransformedAMCObject = Omit<IAMCObject, "order_id"> & {
  order: IOrderObject;
  _id: string;
};

export enum PAYMENT_STATUS_ENUM {
  PAID = "paid",
  PENDING = "pending",
  PARTIAL = "partial",
}

export interface IAMCPayment {
  from_date: Date;
  to_date: Date;
  status: PAYMENT_STATUS_ENUM;
}

export interface IAMCObject {
  order_id: string;
  client: IClientDataObject;
  total_cost: number;
  purchase_order_number?: string;
  amc_frequency_in_months: IAMCFrequency;
  purchase_order_document?: string;
  invoice_document?: string;
  last_payment?: IAMCPayment;
  amount: number;
  start_date: Date;
  products: IProduct[];
  payments?: IAMCPayment[];
  createdAt?: string;
  updatedAt?: string;
}

export type IUpdateOrderRequest = OrderDetailInputs & { orderId: string };

export enum PURCHASE_TYPE {
  CUSTOMIZATION = "customization",
  LICENSE = "license",
  ADDITIONAL_SERVICE = "additional_service",
  ORDER = "order",
}

export interface IPurchase {
  client: Omit<IClientDataObject, "orders">;
  purchase_type: PURCHASE_TYPE;
  products: IPurchase["purchase_type"] extends PURCHASE_TYPE.ADDITIONAL_SERVICE
    ? { name: string }[]
    : IProduct[];
  status: string;
  amc_start_date?: string | Date;
  id: string;
}

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
  tagTypes: [
    "ORDER_DATA",
    "CLIENT_ORDERS_DATA",
    "ORDERS_LIST",
    "AMC_DATA",
    "CUSTOMIZATION_DATA",
    "LICENSE_DATA",
    "ADDITIONAL_SERVICE_DATA",
    "AMC_LIST",
  ],
  endpoints: (builder) => ({
    getOrderById: builder.query<IResponse<IOrderObject>, string>({
      query: (clientId) => `/${clientId}`,
      providesTags: ["ORDER_DATA"],
    }),
    getAllOrdersWithAttributes: builder.query<
      IResponse<{
        purchases: IPurchase[];
        pagination: {
          total: number;
          limit: number;
          page: number;
          pages: number;
        };
      }>,
      { page?: number; limit?: number }
    >({
      query: (body) =>
        `/all-orders?page=${body.page || 1}&limit=${body.limit || 10}`,
      providesTags: ["ORDERS_LIST"],
    }),
    createOrder: builder.mutation<IResponse, CreateOrderRequest>({
      query: (body) => ({
        url: `/${body.client_id}`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: ["ORDER_DATA", "CLIENT_ORDERS_DATA", "ORDERS_LIST"],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        await queryFulfilled;
        dispatch(
          clientApi.util.invalidateTags(["CLIENT_LIST", "CLIENT_DETAIL"])
        );
      },
    }),
    updateOrder: builder.mutation<IResponse, IUpdateOrderRequest>({
      query: (body) => ({
        url: `/${body.orderId}`,
        method: HTTP_REQUEST.PATCH,
        body,
      }),
      invalidatesTags: ["ORDER_DATA", "CLIENT_ORDERS_DATA", "AMC_DATA"],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        await queryFulfilled;
        dispatch(
          clientApi.util.invalidateTags(["CLIENT_LIST", "CLIENT_DETAIL"])
        );
      },
    }),
    getAllClientOrders: builder.query<IResponse<IOrderObject[]>, string>({
      query: (clientId) => `/client/${clientId}`,
    }),
    addLicense: builder.mutation<
      IResponse,
      ILicenseInputs & { order_id: string }
    >({
      query: (body) => ({
        url: `/${body.order_id}/license`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: ["ORDERS_LIST"],
    }),
    addAdditionalService: builder.mutation<
      IResponse,
      IAdditionalServiceInputs & { order_id: string }
    >({
      query: (body) => ({
        url: `/${body.order_id}/additional-service`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: ["ORDERS_LIST"],
    }),
    addCustomization: builder.mutation<
      IResponse,
      ICustomizationInputs & { order_id: string }
    >({
      query: (body) => ({
        url: `/${body.order_id}/customization`,
        method: HTTP_REQUEST.POST,
        body,
      }),
      invalidatesTags: ["ORDERS_LIST", "AMC_DATA"],
    }),
    getAmcByOrderId: builder.query<IResponse<IAMCObject>, string>({
      query: (orderId) => `/${orderId}/amc`,
      providesTags: ["AMC_DATA"],
    }),
    updateAMCByOrderId: builder.mutation<
      IResponse,
      { orderId: string; data: IAmcInputs }
    >({
      query: ({ orderId, data }) => ({
        url: `/${orderId}/amc`,
        method: HTTP_REQUEST.PATCH,
        body: data,
      }),
      invalidatesTags: ["AMC_DATA", "AMC_LIST"],
    }),
    getLicenceById: builder.query<IResponse<ILicenceObject>, string>({
      query: (licenceId) => `/license/${licenceId}`,
      providesTags: ["LICENSE_DATA"],
    }),
    getCustomizationById: builder.query<
      IResponse<ICustomizationObject>,
      string
    >({
      query: (customizationId) => `/customization/${customizationId}`,
      providesTags: ["CUSTOMIZATION_DATA"],
    }),
    getAdditionalServiceById: builder.query<
      IResponse<IAdditionalServiceObject>,
      string
    >({
      query: (additionalServiceId) =>
        `/additional-service/${additionalServiceId}`,
      providesTags: ["ADDITIONAL_SERVICE_DATA"],
    }),
    updateCustomizationById: builder.mutation<
      IResponse,
      ICustomizationInputs & { id: string }
    >({
      query: (body) => ({
        url: `/customization/${body.id}`,
        method: HTTP_REQUEST.PATCH,
        body,
      }),
      invalidatesTags: ["ORDERS_LIST", "CUSTOMIZATION_DATA"],
    }),
    updateLicenseById: builder.mutation<
      IResponse<ILicenceObject>,
      ILicenseInputs & { id: string }
    >({
      query: (body) => ({
        url: `/license/${body.id}`,
        method: HTTP_REQUEST.PATCH,
        body,
      }),
      invalidatesTags: ["ORDERS_LIST", "LICENSE_DATA"],
    }),
    updateAdditionalServiceById: builder.mutation<
      IResponse<IAdditionalServiceObject>,
      IAdditionalServiceInputs & { id: string }
    >({
      query: (body) => ({
        url: `/additional-service/${body.id}`,
        method: HTTP_REQUEST.PATCH,
        body,
      }),
      invalidatesTags: ["ORDERS_LIST", "ADDITIONAL_SERVICE_DATA"],
    }),
    getAllAMC: builder.query<
      IResponse<TransformedAMCObject[]>,
      {
        page?: number;
        limit?: number;
        filter?: AMC_FILTER;
        options: { upcoming: number };
      }
    >({
      query: (body) =>
        `/all-amc?page=${body.page || 1}&limit=${10}&filter=${
          body.filter
        }&upcoming=${body.options.upcoming}`,
      providesTags: ["AMC_LIST"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useGetAllClientOrdersQuery,
  useAddLicenseMutation,
  useAddAdditionalServiceMutation,
  useAddCustomizationMutation,
  useGetAllOrdersWithAttributesQuery,
  useGetAmcByOrderIdQuery,
  useUpdateAMCByOrderIdMutation,
  useGetAdditionalServiceByIdQuery,
  useGetCustomizationByIdQuery,
  useGetLicenceByIdQuery,
  useUpdateCustomizationByIdMutation,
  useUpdateLicenseByIdMutation,
  useUpdateAdditionalServiceByIdMutation,
  useGetAllAMCQuery,
} = orderApi;
