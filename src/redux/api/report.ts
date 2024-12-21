import { HTTP_REQUEST } from "@/contants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";

const reportUrl = `${process.env.NEXT_PUBLIC_API_URL}/reports`;

export type IReportFilters = "monthly" | "quarterly" | "yearly" | "all";

export interface IReportQueries {
  filter: IReportFilters;
  options?: {
    startDate?: Date;
    endDate?: Date;
    year?: number;
    quarter?: string;
  };
}

export interface IDetailedOverAllSalesReportResponse {
  period: string;
  orderRevenue: number;
  customizationRevenue: number;
  licenseRevenue: number;
  additionalServiceRevenue: number;
  amcRevenue: number;
  total: number;
}

export interface IAMCAnnualBreakDown {
  period: string;
  totalExpected: number;
  totalCollected: number;
}

export interface IIndustryWiseRevenue {
  industry: string;
  revenue: number;
  period: string;
}

export interface IProductWiseRevenueReportResponse {
  productId: string;
  productName: string;
  revenue: number;
  percentage: number;
  cumulativePercentage: number;
}

export const reportApi = createApi({
  reducerPath: "report",
  baseQuery: fetchBaseQuery({
    baseUrl: reportUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDetailedOverAllSalesReport: builder.query<
      IResponse<IDetailedOverAllSalesReportResponse[]>,
      IReportQueries
    >({
      query: ({ filter, options }) => ({
        url: `/overall-sales-report?filter=${filter}&startDate=${options?.startDate}&endDate=${options?.endDate}&year=${options?.year}&quarter=${options?.quarter}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
    getAmcRevenueReport: builder.query<
      IResponse<
        Pick<IDetailedOverAllSalesReportResponse, "total" | "period">[]
      >,
      IReportQueries
    >({
      query: ({ filter, options }) => ({
        url: `/amc-revenue-report?filter=${filter}&startDate=${options?.startDate}&endDate=${options?.endDate}&year=${options?.year}&quarter=${options?.quarter}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
    getProductWiseRevenueReport: builder.query<
      IResponse<IProductWiseRevenueReportResponse[]>,
      IReportQueries
    >({
      query: ({ filter, options }) => ({
        url: `/product-wise-revenue-distribution?filter=${filter}&startDate=${options?.startDate}&endDate=${options?.endDate}&year=${options?.year}&quarter=${options?.quarter}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
    getAMCAnnualBreakDown: builder.query<
      IResponse<IAMCAnnualBreakDown[]>,
      IReportQueries & { options: { productId?: string } }
    >({
      query: ({ filter, options }) => ({
        url: `/amc-annual-breakdown?filter=${filter}&startDate=${options?.startDate}&endDate=${options?.endDate}&year=${options?.year}&quarter=${options?.quarter}&productId=${options?.productId}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
    getIndustryWiseRevenueReport: builder.query<
      IResponse<IIndustryWiseRevenue[]>,
      IReportQueries & { options: { month?: string } }
    >({
      query: ({ filter, options }) => ({
        url: `/industry-wise-revenue-distribution?filter=${filter}&month=${options?.month}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
  }),
});

export const {
  useGetDetailedOverAllSalesReportQuery,
  useGetProductWiseRevenueReportQuery,
  useGetAmcRevenueReportQuery,
  useGetAMCAnnualBreakDownQuery,
  useGetIndustryWiseRevenueReportQuery,
} = reportApi;
