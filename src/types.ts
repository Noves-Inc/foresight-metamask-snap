export type ChainsResponse = {
  name: string;
  ecosystem: string;
  evmChainId: number;
};

export type Token = {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
};

export type Nft = {
  name: string;
  id: number;
  symbol: string;
  address: string;
};

export type From = {
  name: string | null;
  address: string;
};

export type To = {
  name: string | null;
  address: string;
};

export type SentReceived = {
  action: string;
  amount: string;
  to: To;
  from: From;
  token?: Token;
  nft?: Nft;
};
