import { ORDER_STATUS_ENUM } from "./client";

export interface OrderDetailInputs {
  products: string[];
  base_cost: number;
  total_cost?: number;
  amc_rate: {
    percentage: number;
    amount: number;
  };
  status: ORDER_STATUS_ENUM;
  payment_terms: {
    name: string;
    percentage_from_base_cost: number;
    calculated_amount: number;
    date: Date;
  }[];
  license?: string;
  agreements: {
    start: Date;
    end: Date;
    document: string;
  }[];
  purchase_order_document?: string;
  invoice_document: string;
  base_cost_seperation?: {
    product_id: string;
    amount: number;
    percentage: number;
  }[];
  purchased_date: Date;
  other_document: {
    title: string;
    url: string;
  };
  amc_start_date: Date;
  customization: CustomizationDetails;
}

export interface LicenseDetails {
  cost_per_license: number;
  total_license: number;
}

export enum CustomizationType {
  MODULE = "module",
  REPORT = "report",
}

export interface CustomizationDetails {
  cost: number;
  modules: string[];
  reports?: string[];
  purchased_date?: Date;
  purchase_order_document?: string;
  type?: CustomizationType;
}
