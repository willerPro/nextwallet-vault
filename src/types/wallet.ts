
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
  amount: number;
  value_usd: number;
  fee?: number;
  created_at: string;
  updated_at: string;
  from_address?: string;
  to_address?: string;
  type: 'send' | 'receive' | 'buy' | 'sell' | 'transfer_in' | 'transfer_out';
  coin_symbol: string;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string;
}
