export interface KitListItem {
  module: string;
  description: string;
  sku: string;
  taxType: string;
  quantity: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  kitList: KitListItem[];
}

export interface ProposalData {
  customerName: string;
  date: string;
  currency: string;
  lineItems: LineItem[];
  introText: string;
  paymentTerms: string;
  validityPeriod: string;
  footerText: string;
  additionalNotes: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  companyName: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  address: string;
  showSkuColumn: boolean;
  showTaxColumn: boolean;
  kitListScale: number;
}

export interface Proposal {
  id: string;
  customerName: string;
  date: string;
  total: number;
  currency: string;
}
