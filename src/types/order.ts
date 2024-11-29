import { ORDER_STATUS_ENUM } from "./client";

export interface OrderDetailInputs {
  products: string[];
  base_cost: number;
  training_implementation_cost?: number;
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
  agreement_document: string;
  agreement_date: {
    start: Date;
    end: Date;
  };
  purchase_order_document: string;
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
  purchased_date?: Date;
  purchase_order_document?: string;
  type?: CustomizationType;
}
