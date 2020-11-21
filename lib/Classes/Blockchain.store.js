"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainStore = void 0;
// Theirs
const mobx_1 = require("mobx");
// Blockchain service
const SmartContract_1 = require("../Classes/SmartContract");
const PERSISTENT_SESSION_LOCAL_STORAGE_KEY = 'persistentSession';
class BlockchainStore {
    constructor(blockchain, logger) {
        this._sessionLoadedCallback = () => { };
        this._sessionPreparationCallback = () => { };
        /** GENERAL */
        this.registerCallbacks = (sessionLoadedCallback, sessionPreparationCallback, logoutCallback) => {
            this._sessionLoadedCallback = sessionLoadedCallback;
            this._sessionPreparationCallback = sessionPreparationCallback;
            this._blockchain.registerLogoutCallback(logoutCallback);
        };
        /** WALLET */
        this.login = async (authType) => {
            this._log.debug('login()');
            try {
                await this._blockchain.connectTo(authType);
            }
            catch (e) {
                this._log.error(e, 'Error while connecting');
            }
        };
        this.logout = () => {
            this._log.debug('logout()');
            // Unsubscribe from receiving new blocks
            this._blockchain.unsubscribeNewBlockHeaders();
            // Clear persistent session
            this._clearPersistentSession();
            // Set Blockchain store state
            this._blockchain.clearWallet();
        };
        this._loadAndCheckIfWasPersisted = () => {
            this._log.debug('_loadAndCheckIfWasPersisted()');
            const localStoragePersistentSession = window.localStorage.getItem(PERSISTENT_SESSION_LOCAL_STORAGE_KEY);
            if (!localStoragePersistentSession) {
                return false;
            }
            const persistentSession = JSON.parse(localStoragePersistentSession);
            // Check wrong persistentSession.address
            if (this.address !== persistentSession.address) {
                this._log.warn('Address in persistent session is wrong');
                this.logout();
                return false;
            }
            return true;
        };
        this._handleWeb3ConnectOnConnect = async () => {
            this._log.debug('_handleWeb3ConnectOnConnect()');
            // Check if session was already persisted
            const wasPersisted = this._loadAndCheckIfWasPersisted();
            if (wasPersisted) {
                // Trigger session loaded callback
                this._sessionLoadedCallback();
                return;
            }
            this._sessionPreparationCallback();
        };
        this._blockchain = blockchain;
        this._log = logger;
        this.subscribeNewBlockHeaders = this._blockchain.subscribeNewBlockHeaders;
        this.watchTx = this._blockchain.watchTx;
        this._blockchain.registerWeb3ModalOnConnectCallback(this._handleWeb3ConnectOnConnect);
    }
    get currentNetworkName() {
        return this._blockchain.currentNetworkName;
    }
    get correctNetwork() {
        return this._blockchain.correctNetwork;
    }
    get address() {
        return this._blockchain.address;
    }
    get clientName() {
        return this._blockchain.clientName;
    }
    /** BLOCKCHAIN ACTIONS */
    /**
     * Calls `approve()` function and tracks transaction
     * @param spender Address of token spender to set
     * @param tokenAddress address of token
     * @param confirmationCallback Callback function, which would be called on first confirmation
     */
    approveToken(tokenAddress, spender, confirmationCallback) {
        const token = new SmartContract_1.IERC20(tokenAddress, this._blockchain, this._log);
        return token.approve(spender, confirmationCallback);
    }
    signTypedMessage(message) {
        return this._blockchain.signTypedData(message);
    }
    /** PERSISTENT SESSION */
    _clearPersistentSession() {
        localStorage.removeItem(PERSISTENT_SESSION_LOCAL_STORAGE_KEY);
        // Remove WalletConnect session if exists
        localStorage.removeItem('walletconnect');
    }
    savePersistentSession() {
        if (!this._blockchain.providerName || !this._blockchain.providerType) {
            return;
        }
        const persistentSession = {
            providerName: this._blockchain.providerName,
            providerType: this._blockchain.providerType,
            address: this.address
        };
        window.localStorage.setItem(PERSISTENT_SESSION_LOCAL_STORAGE_KEY, JSON.stringify(persistentSession));
    }
}
__decorate([
    mobx_1.computed
], BlockchainStore.prototype, "currentNetworkName", null);
__decorate([
    mobx_1.computed
], BlockchainStore.prototype, "correctNetwork", null);
__decorate([
    mobx_1.computed
], BlockchainStore.prototype, "address", null);
__decorate([
    mobx_1.computed
], BlockchainStore.prototype, "clientName", null);
exports.BlockchainStore = BlockchainStore;
exports.default = BlockchainStore;
