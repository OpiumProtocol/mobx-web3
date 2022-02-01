import { ENetwork, TCustomMetamaskChain, TNativeCurrencies } from './Types/blockchain'

export const NETWORK_NAMES: { [networkId: number]: string } = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
  56: 'Binance Smart Chain',
  97: 'Binance Smart Chain Testnet',
  137: 'Polygon Network',
  80001: 'Polygon Mumbai Test Network',
  42161: 'Arbitrum Mainnet',
  421611: 'Arbitrum Rinkeby Testnet'
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
  },
  [ENetwork.ARBITRUM]: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
}



export const CUSTOM_METAMASK_NETWORKS: {
  [key: string]: TCustomMetamaskChain,
} = {
  mainnet: {
    chainId: '1',
    chainName: 'mainnet',
    rpcUrls: [],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.ETHEREUM]
    },
    blockExplorerUrls: ['https://etherscan.io/']
  },
  rinkeby: {
    chainId: '4',
    chainName: 'rinkeby',
    rpcUrls: [],
    nativeCurrency: {    
      ...NETWORK_CURRENCIES[ENetwork.ETHEREUM]
    },
    blockExplorerUrls: ['https://rinkeby.etherscan.io/']
  },
  bscTestnet: {
    chainId: '0x61',
    chainName: 'binanceTestnet',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.BINANCE]
    },
    blockExplorerUrls: ['https://testnet.bscscan.com/']
  },
  bscMainnet: {
    chainId: '0x38',
    chainName: 'binance',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.BINANCE]
    },
    blockExplorerUrls: ['https://bscscan.com/']
  },
  maticMumbai: {
    chainId: '0x13881',
    chainName: 'mumbai',
    rpcUrls: ['https://rpc-mumbai.matic.today', 'wss://ws-mumbai.matic.today'],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.MATIC]
    },
    blockExplorerUrls: ['https://explorer-mumbai.maticvigil.com/']
  },
  maticMainnet: {
    chainId: '0x89',
    chainName: 'matic',
    rpcUrls: ['https://rpc-mainnet.maticvigil.com/', ],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.MATIC]
    },
    blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com/']
  },
  arbitrumMainnet: {
    chainId: '0xA4B1',
    chainName: 'arbitrum mainnet',
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.ARBITRUM]
    },
    blockExplorerUrls: ['https://arbiscan.io']
  },
  arbitrumTestnet: {
    chainId: '0x66EEB',
    chainName: 'arbitrum testnet',
    rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    nativeCurrency: {
      ...NETWORK_CURRENCIES[ENetwork.ARBITRUM]
    },
    blockExplorerUrls: ['https://rinkeby-explorer.arbitrum.io/#/']
  },
}

export default NETWORK_NAMES
