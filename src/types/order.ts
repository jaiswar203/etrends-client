import { ORDER_STATUS_ENUM } from "./client";

export interface OrderDetailInputs {
  products: string[];
  base_cost: number;
  training_implementation_cost?: number;
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
  other_document: {
    title: string;
    url: string;
  };
  deployment_date: Date;
  customization: CustomizationDetails;
}

export interface LicenseDetails {
  cost_per_license: number;
  total_license: number;
}

export interface CustomizationDetails {
  cost: number;
  amc_rate: {
    percentage: number;
    amount: number;
  };
  modules: string[];
}
