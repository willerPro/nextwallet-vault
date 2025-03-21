
export interface Asset {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
  wallet_address: string;
  network: string;
  created_at: string;
  updated_at: string;
  balance: number;
  fiat_value: number;
  user_id: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  asset_id?: string;
  asset_name?: string;
  asset_symbol?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
