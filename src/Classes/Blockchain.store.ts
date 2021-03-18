// Theirs
import { computed } from 'mobx'
// Blockchain service
import { IERC20 } from '../Classes/SmartContract'
// Constants
import {
  EIP712Message,
  AuthType,
  PersistentSession,
} from '../Constants/Types/blockchain'
import { Logger } from './../utils/logger'

import Blockchain from './Blockchain'

const PERSISTENT_SESSION_LOCAL_STORAGE_KEY = 'persistentSession'

export class BlockchainStore {
  protected _blockchain: Blockchain
  protected _log: Logger
  public subscribeNewBlockHeaders: any
  public watchTx: any

  @computed
  get currentNetworkName () {
    return this._blockchain.currentNetworkName
  }

  @computed
  get requiredNetworkName () {
    return this._blockchain.requiredNetworkName
  }

  @computed
  get correctNetwork () {
    return this._blockchain.correctNetwork
  }

  @computed
  get address () {
    return this._blockchain.address
  }

  @computed
  get clientName () {
    return this._blockchain.clientName
  }

  private _sessionLoadedCallback = () => {}
  private _sessionPreparationCallback = () => {}

  constructor (blockchain: any, logger: Logger) {
    this._blockchain = blockchain
    this._log = logger
    this.subscribeNewBlockHeaders = this._blockchain.subscribeNewBlockHeaders
    this.watchTx = this._blockchain.watchTx
    this._blockchain.registerWeb3ModalOnConnectCallback(
      this._handleWeb3ConnectOnConnect
    )
  }

  /** GENERAL */
  public registerCallbacks = (
    sessionLoadedCallback: () => void,
    sessionPreparationCallback: () => void,
    sessionEndedCallback: () => void
  ) => {
    this._sessionLoadedCallback = sessionLoadedCallback
    this._sessionPreparationCallback = sessionPreparationCallback
    this._blockchain.registerLogoutCallback(sessionEndedCallback)
  }

  /** BLOCKCHAIN ACTIONS */
  /**
   * Calls `approve()` function and tracks transaction
   * @param spender Address of token spender to set
   * @param tokenAddress address of token
   * @param confirmationCallback Callback function, which would be called on first confirmation
   */
  public approveToken (
    tokenAddress: string,
    spender: string,
    confirmationCallback: () => void
  ): Promise<string> {
    const token = new IERC20(tokenAddress, this._blockchain, this._log)
    return token.approve(spender, confirmationCallback)
  }

  public signTypedMessage (message: EIP712Message) {
    return this._blockchain.signTypedData(message)
  }

  /** WALLET */
  public login = async (authType: AuthType) => {
    this._log.debug('login()')
    try {
      await this._blockchain.connectTo(authType)
    } catch (e) {
      this._log.error(e, 'login(): Error while connecting')
    }
  }

  public logout = () => {
    this._log.debug('logout()')

    // Unsubscribe from receiving new blocks
    this._blockchain.unsubscribeNewBlockHeaders()

    // Clear persistent session
    this._clearPersistentSession()

    // Set Blockchain store state
    this._blockchain.clearWallet(true)
  }

  /** PERSISTENT SESSION */
  private _clearPersistentSession () {
    localStorage.removeItem(PERSISTENT_SESSION_LOCAL_STORAGE_KEY)

    // Remove WalletConnect session if exists
    localStorage.removeItem('walletconnect')

    // Remove WalletLink session if exists
    localStorage.removeItem('-walletlink:https://www.walletlink.org:session:id')
    localStorage.removeItem('-walletlink:https://www.walletlink.org:session:secret')
    localStorage.removeItem('-walletlink:https://www.walletlink.org:session:linked')
    localStorage.removeItem('-walletlink:https://www.walletlink.org:Addresses')
  }

  public savePersistentSession () {
    if (!this._blockchain.providerName || !this._blockchain.providerType) {
      return
    }

    const persistentSession: PersistentSession = {
      providerName: this._blockchain.providerName,
      providerType: this._blockchain.providerType,
      address: this.address
    }

    window.localStorage.setItem(
      PERSISTENT_SESSION_LOCAL_STORAGE_KEY,
      JSON.stringify(persistentSession)
    )
  }

  private _loadAndCheckIfWasPersisted = () => {
    this._log.debug('_loadAndCheckIfWasPersisted()')
    const localStoragePersistentSession = window.localStorage.getItem(
      PERSISTENT_SESSION_LOCAL_STORAGE_KEY
    )

    if (!localStoragePersistentSession) {
      return false
    }

    const persistentSession: PersistentSession = JSON.parse(
      localStoragePersistentSession
    )

    // Check wrong persistentSession.address
    if (this.address !== persistentSession.address) {
      this._log.warn('Address in persistent session is wrong')
      this.logout()
      return false
    }

    return true
  }

  private _handleWeb3ConnectOnConnect = async () => {
    this._log.debug('_handleWeb3ConnectOnConnect()')
    // Check if session was already persisted
    const wasPersisted = this._loadAndCheckIfWasPersisted()
    if (wasPersisted) {
      // Trigger session loaded callback
      this._sessionLoadedCallback()
      return
    }

    this._sessionPreparationCallback()
  }
}

export default BlockchainStore
