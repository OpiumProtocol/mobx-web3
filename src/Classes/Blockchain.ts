// Theirs
import Web3Modal, {getProviderInfo} from 'web3modal'
import {action, computed, observable} from 'mobx'
import {WalletLink, WalletLinkProvider} from 'walletlink'
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider'
import Fortmatic from 'fortmatic'
import Web3 from 'web3'
import {Subscription} from 'web3-core-subscriptions'
import {BlockHeader} from 'web3-eth'
import MewConnect from '@myetherwallet/mewconnect-web-client'
// Constants
import {AuthType, ClientName, ProviderName, ProviderType} from '../Constants/Types/blockchain'
import NETWORK_NAMES from '../Constants/networks'
import {Logger} from './../utils/logger'

interface WalletLinkOptions {
  /** Application name */
  appName: string
  /** @optional Application logo image URL favicon is used if unspecified */
  appLogoUrl?: string | null
  /** @optional Use dark theme */
  darkMode?: boolean
  /** @required Your Infura account ID */
  infuraId: string
  /** @optional Network ID to connect to */
  networkId: number
}

const getWalletName = (clientWallet: string): ClientName => {
  switch (clientWallet) {
    case 'The Art Exchange':
      return ClientName.ART_WALLET
    default:
      return ClientName.UNKNOWN
  }
}

// TODO: fix bunyan logger type
class Blockchain {
  // Web3
  protected _web3: Web3 | null = null
  protected _provider: any | null = null
  protected _web3ws: Web3
  protected _subscription: Subscription<BlockHeader> | null = null
  protected _log: Logger
  protected _injectedWalletChangesRefreshTime: number = 1000

  protected _ethereum: WalletLinkProvider | null = null
  @observable protected _networkId = 0
  @observable protected _requiredNetworkId = 0
  public providerName: ProviderName | null = null
  public providerType: ProviderType | null = null

  @observable public clientName: ClientName = ClientName.UNKNOWN
  
  // Web3Modal
  protected _web3Modal: Web3Modal

  private _periodicalCheckIntervalId: number = 0

  // Wallet
  @observable public web3Connected: boolean = false
  @observable public address: string = ''

  @computed 
  get correctNetwork() {
    return this._networkId === this._requiredNetworkId
  }

  @computed
  get currentNetworkName() {
    const networkName = NETWORK_NAMES[this._networkId]
    return networkName || 'Unknown network'
  }

  @computed
  get requiredNetworkName() {
    return NETWORK_NAMES[this._requiredNetworkId]
  }

  constructor(networkId: number, networkName: string, infuraId: string, fortmaticKey: string, infuraWs: string, logger: Logger) {
    
    this._web3Modal = new Web3Modal({
      cacheProvider: true,
      network: networkName,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId
          }
        },
        fortmatic: {
          package: Fortmatic,
          options: {
            key: fortmaticKey
          }
        },
        'custom-walletlink': {
          display: {
            logo: 'logo',
            name: 'WalletLink',
            description: 'Scan with WalletLink to connect',
          },
          options: {
            appName: 'Opium Finance',
            appLogoUrl: 'logo',
            darkMode: false,
            infuraId,
            networkId,
          },
          package: WalletLink,
          connector: async (
            ProviderPackage: any,
            options: WalletLinkOptions
          ) => {
            const { appName, infuraId, networkId } = options
            const walletLink = new WalletLink({
              appName,
            })
            const networkUrl = `https://mainnet.infura.io/v3/${infuraId}`
            const provider = walletLink.makeWeb3Provider(networkUrl, networkId)
            await provider.enable()
            return provider
          },
        },
        mewconnect: {
          package: MewConnect,
          options: {
            infuraId
          }
        }
      }
    })

    this._networkId = networkId
    this._requiredNetworkId = networkId

    this._log = logger

    this._web3ws = new Web3(
      new Web3.providers.WebsocketProvider(infuraWs)
    )
    // subscribe to close
    this._web3Modal.on('close', () => {
      // this._log.debug('Web3Modal Modal Closed') // modal has closed
    })

    this._web3ws
  }

  // Web3Modal
  public toggleWeb3Modal() {
    this._log.debug('toggleWeb3Modal()')
    return this._web3Modal.toggleModal()
  }

  public connectTo(authType: AuthType) {
    this._log.debug('connectTo()')
    return this._web3Modal.connectTo(authType)
  }

  async registerWeb3ModalOnConnectCallback(callback: () => void) {
    this._log.debug('registerWeb3ModalOnConnectCallback()')
    // Register onConnect callback
    this._web3Modal.on('connect', async (provider: any) => {
      this._log.debug('web3Modal.on(connect)')

      // Clear wallet in case was already connected
      this.clearWallet()
      // Initialize web3modal related variables
      await this._initWeb3Modal(provider)
      callback()
    })

    // Check if there is cached provider and try to connect to it
    if (this._web3Modal.cachedProvider) {
      await this._web3Modal.connect()
    }
  }

  // General
  getWeb3() {
    return this._web3
  }

  // Wallet
  public watchTx = (txHash: string): Promise<void> => {
    this._log.debug('watchTx()', txHash)
    return new Promise((resolve, reject) => {
      if (!this._web3) {
        reject(new Error('Web3 not initialized'))
      }

      const intervalId = setInterval(async () => {
        this._log.debug('watchTx() interval', this._web3)
        if (!this._web3) {
          return clearInterval(intervalId)
        }

        try {
          const txReceipt = await this._web3.eth.getTransactionReceipt(txHash)

          this._log.debug('watchTx() txReceipt', txReceipt)
          // If no receipt found, wait
          if (!txReceipt) {
            return
          }

          if (txReceipt.status) {
            resolve()
          } else {
            reject()
          }
          return clearInterval(intervalId)
        } catch (e) {
          const error: Error = e
          this._log.error(error, 'watchTx() interval: Internal error')
        }
      }, 1000) as unknown as number // Once per second
    })
  }

  async signTypedData(data: any): Promise<string> {
    this._log.debug('signTypedData()')
    if (!this._provider) {
      throw new Error('Provider is not initialized')
    }

    if (!this._web3) {
      throw new Error('Web3 is not initialized')
    }


    let signature: string

    const accounts = await this._web3.eth.getAccounts()
    const signer = accounts[0]

    switch (this.providerName) {
      case ProviderName.MetaMask:
      case ProviderName.Fortmatic:
        signature = await this._signTypedDataV3(data, signer)
        break
      case ProviderName.Cipher:
      case ProviderName.WalletConnect:
        signature = await this._signTypedDataReversed(data, signer)
        break
      default:
        signature = await this._signTypedData(data, signer)
    }

    return signature
  }

  private _signTypedData(data: any, signer: string): Promise<string> {
    this._log.debug('_signTypedData()')
    return new Promise(async (resolve, reject) => {
      await this._provider.send(
        {
          method: 'eth_signTypedData',
          params: [signer, JSON.stringify(data)],
        },
        (error: any, result: any) => {
          if (error || result.error) {
            return reject(error || result.error)
          }
          const signature = result.result.substring(2)
          resolve(signature)
        }
      )
    })
  }

  private _signTypedDataReversed(data: any, signer: string): Promise<string> {
    this._log.debug('_signTypedDataReversed()')
    return new Promise(async (resolve, reject) => {
      await this._provider.send(
        {
          method: 'eth_signTypedData',
          params: [JSON.stringify(data), signer]
        },
        (error: any, result: any) => {
          if (error || result.error) {
            return reject(error || result.error)
          }
          const signature = result.result.substring(2)
          resolve(signature)
        }
      )
    })
  }

  private _signTypedDataV3(data: any, signer: string): Promise<string> {
    this._log.debug('_signTypedDataV3()')
    return new Promise(async (resolve, reject) => {
      await this._provider.send(
        {
          method: 'eth_signTypedData_v3',
          params: [signer, JSON.stringify(data)],
        },
        (error: any, result: any) => {
          if (error || result.error) {
            return reject(error || result.error)
          }
          const signature = result.result.substring(2)
          resolve(signature)
        }
      )
    })
  }

  @action
  public clearWallet() {
    this._log.debug('clearWallet()')
    // Clear wallet related vars
    this.web3Connected = false
    this.address = ''
    // Stop periodical checks
    clearInterval(this._periodicalCheckIntervalId)

    // Clear cached provider
    this._web3Modal.clearCachedProvider()

    switch (this.providerName) {
      case ProviderName.WalletConnect:
        // TODO: when implemented this._provider.wc.close
        break
    }

    // TODO: Clear provider, types, web3, etc
  }
  
  public subscribeNewBlockHeaders = (_callback: () => void) => {
    this._log.debug('subscribeNewBlockHeaders()')
    if (this._subscription) {
      this._log.warn('Already subscribed')
      return
    }

    const subscription = this._web3ws.eth.subscribe(
      'newBlockHeaders',
      (error, blockHeader) => {
        if (error) {
          this._log.error(error, 'subscribe newBlockHeaders: Internal error')
        }
      }
    )
    
    this._subscription = subscription
    subscription.on('data', _callback)
    subscription.on('error', error => this._log.error(error, 'subscription: Error while fetching block'))
  }

  public unsubscribeNewBlockHeaders() {
    this._log.debug('unsubscribeNewBlockHeaders()')
    if (!this._subscription) {
      this._log.warn('Not subscribed yet')
      return
    }

    this._subscription.unsubscribe()
    this._subscription = null
  }
  
  // Web3
  private async _initWeb3Modal(provider: any) {
    this._log.debug('_initWeb3Modal()')
    const providerInfo = getProviderInfo(provider)

    this.providerName = Object.keys(ProviderName).indexOf(providerInfo.name) !== -1 ? providerInfo.name as ProviderName : ProviderName.Unknown
    this.providerType = Object.keys(ProviderType).indexOf(providerInfo.type) !== -1 ? providerInfo.type as ProviderType : ProviderType.unknown

    this._log.debug('Provider name and type', providerInfo.name, providerInfo.type)

    await this._initWeb3(provider)
  }

  @action
  private async _initWeb3(provider: any) {
    this._log.debug('_initWeb3()')
    const web3 = new Web3(provider)

    // Init wallet
    const accounts = await web3.eth.getAccounts()
    if (accounts.length) {
      this.web3Connected = true
      this.address = accounts[0].toLowerCase()
    }

    // Run periodical checks for address and network change
    this._periodicalCheckIntervalId = setInterval(async () => {
      const accounts = await web3.eth.getAccounts()
      // Already logged in and changed account || Just logged in
      if (
        this.web3Connected &&
        accounts.length &&
        this.address.length &&
        accounts[0].toLowerCase() !== this.address
      ) {
        this._log.debug('Address changed')
        this.address = accounts[0].toLowerCase()
      }

      const networkId = await web3.eth.net.getId()
      // Already logged in and changed network || Just logged in
      if (
        this.web3Connected &&
        this._networkId !== networkId
      ) {
        this._log.debug('Network changed')
        this._networkId = networkId
      }
    }, this._injectedWalletChangesRefreshTime) as unknown as number

    this._web3 = web3
    this._provider = provider

    // Wallet specific settings
    switch (this.providerName) {
      case ProviderName.MetaMask:
        this._provider.autoRefreshOnNetworkChange = false
        this._provider.on('chainChanged', async () => {
          this._networkId = await web3.eth.net.getId()
        })
        break
      case ProviderName.WalletConnect:
        const walletName = getWalletName(this._provider.wc.session.clientMeta.name)
        this.clientName = walletName
        this._log.info(this.clientName)

        this._provider.on('chainChanged', async () => {
          this._networkId = await web3.eth.net.getId()
        })
        break
      case ProviderName['MEW wallet']:
        this._provider.on('disconnected', () => {
          this.clearWallet()
        })
    }

    this._networkId = await this._web3.eth.net.getId()
  }
}

export default Blockchain
