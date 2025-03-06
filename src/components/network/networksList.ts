
export interface Network {
  name: string;
  token: string;
  chainId: string;
  rpcUrl: string;
}

export const networks: Network[] = [
  {
    name: "Ethereum Mainnet",
    token: "ETH",
    chainId: "1",
    rpcUrl: "https://mainnet.infura.io/v3/"
  },
  {
    name: "Binance Smart Chain",
    token: "BNB",
    chainId: "56",
    rpcUrl: "https://bsc-dataseed.binance.org/"
  },
  {
    name: "Polygon",
    token: "MATIC",
    chainId: "137",
    rpcUrl: "https://polygon-rpc.com/"
  },
  {
    name: "Arbitrum One",
    token: "ETH",
    chainId: "42161",
    rpcUrl: "https://arb1.arbitrum.io/rpc"
  },
  {
    name: "Optimism",
    token: "ETH",
    chainId: "10",
    rpcUrl: "https://mainnet.optimism.io"
  },
  {
    name: "Avalanche C-Chain",
    token: "AVAX",
    chainId: "43114",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc"
  },
  {
    name: "Fantom Opera",
    token: "FTM",
    chainId: "250",
    rpcUrl: "https://rpc.ftm.tools/"
  },
  {
    name: "Gnosis Chain",
    token: "xDAI",
    chainId: "100",
    rpcUrl: "https://rpc.gnosischain.com"
  },
  {
    name: "Base",
    token: "ETH",
    chainId: "8453",
    rpcUrl: "https://mainnet.base.org"
  },
  {
    name: "Solana",
    token: "SOL",
    chainId: "solana",
    rpcUrl: "https://api.mainnet-beta.solana.com"
  }
];
