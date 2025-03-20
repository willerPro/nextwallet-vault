
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

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  type: "sent" | "received" | "swap" | "buy" | "sell";
  amount: number;
  value_usd: number;
  coin_symbol: string;
  from_address?: string;
  to_address?: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at?: string;
  tx_hash?: string;
  fee?: number;
}
