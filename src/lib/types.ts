export interface ClientForm {
  name: string;
  title: string;
  email: string;
  phone: string;
  organization: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Section {
  id: string;
  name: string;
  equipment: {
    inventory_item_id: string;
    name: string;
    quantity: number;
    category: string;
    image_url: string | null;
    description?: string;
    unit_price?: number;
  }[];
}
export interface FeeInput {
  description: string;
  amount: string;
  notes: string;
  type: "nrc" | "mrc";
  totalUser?: string;
  feesPerUser?: string;
}
export interface Fee extends FeeInput {
  id: string;
}

export interface Quote {
  id: string;
  title: string;
  quote_number: string;
  status: string;
  total_mrr: number;
  total_nrc: number;
  term_months: number;
  notes: string;
  created_at: Date;
  updated_at: Date;
  variables: QuoteVariable[];
  items: QuoteItem[];
  total_users: number;
  amount_per_user: number;
}

export interface QuoteVariable {
  id: string;
  quote_id: string;
  name: string;
  value: string;
}

export interface QuoteItemInput {
  inventory_item_id: string;
  section_name: string;
  name: string;
  quantity: number;
  unit_price: number;
  is_recurring: boolean;
  description?: string;
  image_url?: string;
  category: string;
}

export interface QuoteItem extends QuoteItemInput {
  id: string;
}

export interface QuoteInput {
  title: string;
  status: string;
  total_mrr: number;
  total_nrc: number;
  term_months: number;
  notes: string;
  total_users?: number;
  amount_per_user?: number;
}

export interface QuoteVariableInput {
  name: string;
  value: string;
}
