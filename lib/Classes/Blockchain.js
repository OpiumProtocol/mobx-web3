"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Theirs
const index_1 = __importStar(require("@opiumteam/web3modal/dist/index"));
const mobx_1 = require("mobx");
// @ts-ignore
const web3_provider_1 = __importDefault(require("@walletconnect/web3-provider"));
const fortmatic_1 = __importDefault(require("fortmatic"));
const web3_1 = __importDefault(require("web3"));
// Constants
const blockchain_1 = require("../Constants/Types/blockchain");
const networks_1 = __importDefault(require("../Constants/networks"));
const getWalletName = (clientWallet) => {
    switch (clientWallet) {
        case 'The Art Exchange':
            return blockchain_1.ClientName.ART_WALLET;
        default:
            return blockchain_1.ClientName.UNKNOWN;
    }
};
// TODO: fix bunyan logger type
class Blockchain {
    constructor(networkId, networkName, infuraId, fortmaticKey, infuraWs, logger) {
        // Web3
        this._web3 = null;
        this._provider = null;
        this._subscription = null;
        this._injectedWalletChangesRefreshTime = 1000;
        this._networkId = 0;
        this.providerName = null;
        this.providerType = null;
        this.clientName = blockchain_1.ClientName.UNKNOWN;
        this._periodicalCheckIntervalId = 0;
        // Wallet
        this.web3Connected = false;
        this.address = '';
        this._logoutCallback = () => { };
        // Wallet
        this.watchTx = (txHash) => {
            this._log.debug('watchTx()', txHash);
            return new Promise((resolve, reject) => {
                if (!this._web3) {
                    reject(new Error('Web3 not initialized'));
                }
                const intervalId = setInterval(async () => {
                    this._log.debug('watchTx() interval', this._web3);
                    if (!this._web3) {
                        return clearInterval(intervalId);
                    }
                    try {
                        const txReceipt = await this._web3.eth.getTransactionReceipt(txHash);
                        this._log.debug('watchTx() txReceipt', txReceipt);
                        // If no receipt found, wait
                        if (!txReceipt) {
                            return;
                        }
                        if (txReceipt.status) {
                            resolve();
                        }
                        else {
                            reject();
                        }
                        return clearInterval(intervalId);
                    }
                    catch (e) {
                        this._log.error(e);
                    }
                }, 1000); // Once per second
            });
        };
        this.subscribeNewBlockHeaders = (_callback) => {
            this._log.debug('subscribeNewBlockHeaders()');
            if (this._subscription) {
                this._log.error('Already subscribed');
                return;
            }
            const subscription = this._web3ws.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
                if (error) {
                    this._log.error(error.message);
                }
            });
            this._subscription = subscription;
            subscription.on('data', _callback);
            subscription.on('error', error => console.error('Error while fetching block'));
        };
        this._web3Modal = new index_1.default({
            cacheProvider: true,
            network: networkName,
            providerOptions: {
                walletconnect: {
                    package: web3_provider_1.default,
                    options: {
                        infuraId
                    }
                },
                fortmatic: {
                    package: fortmatic_1.default,
                    options: {
                        key: fortmaticKey
                    }
                }
            }
        });
        this._networkId = networkId;
        this._log = logger;
        this._web3ws = new web3_1.default(new web3_1.default.providers.WebsocketProvider(infuraWs));
        // subscribe to close
        this._web3Modal.on('close', () => {
            // this._log.debug('Web3Modal Modal Closed') // modal has closed
        });
    }
    get correctNetwork() {
        return this._networkId === this._networkId;
    }
    get currentNetworkName() {
        const networkName = networks_1.default[this._networkId];
        return networkName || 'Unknown network';
    }
    get requiredNetworkName() {
        return networks_1.default[this._networkId];
    }
    // Web3Modal
    toggleWeb3Modal() {
        this._log.debug('toggleWeb3Modal()');
        return this._web3Modal.toggleModal();
    }
    connectTo(authType) {
        this._log.debug('connectTo()');
        return this._web3Modal.connectTo(authType);
    }
    async registerWeb3ModalOnConnectCallback(callback) {
        this._log.debug('registerWeb3ModalOnConnectCallback()');
        // Register onConnect callback
        this._web3Modal.on('connect', async (provider) => {
            this._log.debug('web3Modal.on(connect)');
            await this._initWeb3Modal(provider);
            callback();
        });
        // Check if there is cached provider and try to connect to it
        if (this._web3Modal.cachedProvider) {
            await this._web3Modal.connect();
        }
    }
    registerLogoutCallback(callback) {
        this._log.debug('registerLogoutCallback()');
        this._logoutCallback = callback;
    }
    // General
    getWeb3() {
        return this._web3;
    }
    async signTypedData(data) {
        this._log.debug('signTypedData()');
        if (!this._provider) {
            throw new Error('Provider is not initialized');
        }
        if (!this._web3) {
            throw new Error('Web3 is not initialized');
        }
        let signature;
        const accounts = await this._web3.eth.getAccounts();
        const signer = accounts[0];
        switch (this.providerName) {
            case blockchain_1.ProviderName.MetaMask:
            case blockchain_1.ProviderName.Fortmatic:
                signature = await this._signTypedDataV3(data, signer);
                break;
            case blockchain_1.ProviderName.Cipher:
            case blockchain_1.ProviderName.WalletConnect:
                signature = await this._signTypedDataReversed(data, signer);
                break;
            default:
                signature = await this._signTypedData(data, signer);
        }
        return signature;
    }
    _signTypedData(data, signer) {
        this._log.debug('_signTypedData()');
        return new Promise(async (resolve, reject) => {
            await this._provider.send({
                method: 'eth_signTypedData',
                params: [signer, JSON.stringify(data)],
            }, (error, result) => {
                if (error || result.error) {
                    return reject(error || result.error);
                }
                const signature = result.result.substring(2);
                resolve(signature);
            });
        });
    }
    _signTypedDataReversed(data, signer) {
        this._log.debug('_signTypedDataReversed()');
        return new Promise(async (resolve, reject) => {
            await this._provider.send({
                method: 'eth_signTypedData',
                params: [JSON.stringify(data), signer]
            }, (error, result) => {
                if (error || result.error) {
                    return reject(error || result.error);
                }
                const signature = result.result.substring(2);
                resolve(signature);
            });
        });
    }
    _signTypedDataV3(data, signer) {
        this._log.debug('_signTypedDataV3()');
        return new Promise(async (resolve, reject) => {
            await this._provider.send({
                method: 'eth_signTypedData_v3',
                params: [signer, JSON.stringify(data)],
            }, (error, result) => {
                if (error || result.error) {
                    return reject(error || result.error);
                }
                const signature = result.result.substring(2);
                resolve(signature);
            });
        });
    }
    clearWallet() {
        this._log.debug('clearWallet()');
        // Clear wallet related vars
        this.web3Connected = false;
        this.address = '';
        // Stop periodical checks
        clearInterval(this._periodicalCheckIntervalId);
        // Clear cached provider
        this._web3Modal.clearCachedProvider();
        switch (this.providerName) {
            case blockchain_1.ProviderName.WalletConnect:
                // TODO: when implemented this._provider.wc.close
                break;
        }
    }
    unsubscribeNewBlockHeaders() {
        this._log.debug('unsubscribeNewBlockHeaders()');
        if (!this._subscription) {
            this._log.error('Not subscribed yet');
            return;
        }
        this._subscription.unsubscribe();
        this._subscription = null;
    }
    // Web3
    async _initWeb3Modal(provider) {
        this._log.debug('_initWeb3Modal()');
        const providerInfo = index_1.getProviderInfo(provider);
        this.providerName = Object.keys(blockchain_1.ProviderName).indexOf(providerInfo.name) !== -1 ? providerInfo.name : blockchain_1.ProviderName.Unknown;
        this.providerType = Object.keys(blockchain_1.ProviderType).indexOf(providerInfo.type) !== -1 ? providerInfo.type : blockchain_1.ProviderType.unknown;
        this._log.debug('Provider name and type', providerInfo.name, providerInfo.type);
        await this._initWeb3(provider);
    }
    async _initWeb3(provider) {
        this._log.debug('_initWeb3()');
        const web3 = new web3_1.default(provider);
        // Init wallet
        const accounts = await web3.eth.getAccounts();
        if (accounts.length) {
            this.web3Connected = true;
            this.address = accounts[0].toLowerCase();
        }
        // Run periodical checks for address and network change
        this._periodicalCheckIntervalId = setInterval(async () => {
            const accounts = await web3.eth.getAccounts();
            // Already logged in and changed account || Just logged in
            if (this.web3Connected &&
                accounts.length &&
                this.address.length &&
                accounts[0].toLowerCase() !== this.address) {
                this._log.debug('Address changed');
                this._logoutCallback();
            }
            const networkId = await web3.eth.net.getId();
            // Already logged in and changed network || Just logged in
            if (this.web3Connected &&
                this._networkId !== networkId) {
                this._log.debug('Network changed');
                this._networkId = networkId;
            }
        }, this._injectedWalletChangesRefreshTime);
        this._web3 = web3;
        this._provider = provider;
        // Wallet specific settings
        switch (this.providerName) {
            case blockchain_1.ProviderName.MetaMask:
                this._provider.autoRefreshOnNetworkChange = false;
                this._provider.on('chainChanged', async () => {
                    this._networkId = await web3.eth.net.getId();
                });
                break;
            case blockchain_1.ProviderName.WalletConnect:
                const walletName = getWalletName(this._provider.wc.session.clientMeta.name);
                this.clientName = walletName;
                this._log.info(this.clientName);
                this._provider.on('chainChanged', async () => {
                    this._networkId = await web3.eth.net.getId();
                });
                break;
        }
        this._networkId = await this._web3.eth.net.getId();
    }
}
__decorate([
    mobx_1.observable
], Blockchain.prototype, "_networkId", void 0);
__decorate([
    mobx_1.observable
], Blockchain.prototype, "clientName", void 0);
__decorate([
    mobx_1.observable
], Blockchain.prototype, "web3Connected", void 0);
__decorate([
    mobx_1.observable
], Blockchain.prototype, "address", void 0);
__decorate([
    mobx_1.computed
], Blockchain.prototype, "correctNetwork", null);
__decorate([
    mobx_1.computed
], Blockchain.prototype, "currentNetworkName", null);
__decorate([
    mobx_1.computed
], Blockchain.prototype, "requiredNetworkName", null);
__decorate([
    mobx_1.action
], Blockchain.prototype, "clearWallet", null);
__decorate([
    mobx_1.action
], Blockchain.prototype, "_initWeb3", null);
exports.default = Blockchain;
