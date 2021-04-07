import { ENetwork, TCustomMetamaskChain, TNativeCurrencies } from "./Types/blockchain"

export const NETWORK_NAMES: { [networkId: number]: string } = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
  56: 'Binance Smart Chain',
  97: 'Binance Smart Chain Testnet',
  137: 'Matic Network',
  80001: 'Matic Mumbai'
}

export const NETWORK_HEX_IDS = {
  97: '0x61',
  56: '0x38'
}

export const NETWORK_CURRENCIES: TNativeCurrencies = {
  [ENetwork.ETHEREUM]: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  [ENetwork.BINANCE]: {
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: 18,
  },
  [ENetwork.MATIC]: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
}



export const CUSTOM_METAMASK_NETWORKS: {
  [key: string]: TCustomMetamaskChain,
} = {
  mainnet: {
    chainId: '1',
    chainName: 'Ethereum',
    rpcUrls: [],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.ETHEREUM]
    }
  },
  rinkeby: {
    chainId: '4',
    chainName: 'Ethereum',
    rpcUrls: [],
    nativeCurrency: {    
      ...NETWORK_CURRENCIES[ENetwork.ETHEREUM]
    }
  },
  bscTestnet: {
    chainId: '0x61',
    chainName: 'Binance Smart Chain Testnet',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.BINANCE]
    }
  },
  bscMainnet: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain Mainnet',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.BINANCE]
    }
  },
  maticMumbai: {
    chainId: '0x13881',
    chainName: 'Mumbai',
    rpcUrls: ["https://rpc-mumbai.matic.today","wss://ws-mumbai.matic.today"],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.MATIC]
    }
  },
  maticMainnet: {
    chainId: '0x89',
    chainName: 'Matic Network',
    rpcUrls: ['https://rpc-mainnet.maticvigil.com/', ],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.MATIC]
    }
  }
}

export default NETWORK_NAMES
