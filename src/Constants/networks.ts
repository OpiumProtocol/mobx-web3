const NETWORK_NAMES: { [networkId: number]: string } = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
  56: 'Binance Smart Chain',
  97: 'Binance Smart Chain Testnet'
}

export const NETWORK_HEX_IDS = {
  97: '0x61',
  56: '0x38'
}

export default NETWORK_NAMES
