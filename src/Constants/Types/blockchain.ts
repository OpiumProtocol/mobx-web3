export type EIP712Message = {
  types: any
  primaryType: string
  domain: any
  message: any
}

export enum AuthType {
  WALLET_CONNECT = 'walletconnect',
  INJECTED = 'injected',
  FORTMATIC = 'fortmatic',
  COINBASE = 'custom-walletlink',
  MEW_CONNECT = 'mewconnect'
}

export enum ProviderName {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  Trust = 'Trust',
  Fortmatic = 'Fortmatic',
  'MEW wallet' = 'MEW wallet',
  Cipher = 'Cipher', // Crashes
  Coinbase = 'Coinbase', // Doesn't support
  Dapper = 'Dapper', // Doesn't support
  Web3 = 'Web3', // [e.g. Opera] Error
  Unknown = 'Unknown'
}

export enum ProviderType {
  injected = 'injected',
  qrcode = 'qrcode',
  web = 'web',
  unknown = 'unknown'
}

export enum ClientName {
  UNKNOWN = 'UNKNOWN',
  ART_WALLET = 'ART_WALLET',
  OPIUM_WALLET = 'OPIUM_WALLET',
  OFI_WALLET = 'OFI_WALLET'
}

export type PersistentSession = {
  providerName: ProviderName
  providerType: ProviderType
  address: string
}
