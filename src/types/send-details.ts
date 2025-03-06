
export interface Asset {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
  network: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
  balance?: number;
  fiat_value?: number;
  user_id?: string;
}

export interface Contact {
  id: string;
  name: string;
  wallet_address: string;
  network?: string;
  asset_symbol?: string;
  email?: string;
  user_id?: string;
  asset_id?: string;
  asset_name?: string;
  created_at?: string;
  updated_at?: string;
}
