import Web3 from 'web3';
import { Subscription } from 'web3-core-subscriptions';
import { BlockHeader } from 'web3-eth';
import Web3Modal from '@opiumteam/web3modal/dist/index';
export declare type EIP712Message = {
    types: any;
    primaryType: string;
    domain: any;
    message: any;
};
export declare enum AuthType {
    WALLET_CONNECT = "walletconnect",
    INJECTED = "injected",
    FORTMATIC = "fortmatic"
}
export declare enum ProviderName {
    MetaMask = "MetaMask",
    WalletConnect = "WalletConnect",
    Trust = "Trust",
    Fortmatic = "Fortmatic",
    Cipher = "Cipher",
    Coinbase = "Coinbase",
    Dapper = "Dapper",
    Web3 = "Web3",
    Unknown = "Unknown"
}
export declare enum ProviderType {
    injected = "injected",
    qrcode = "qrcode",
    web = "web",
    unknown = "unknown"
}
export declare enum ClientName {
    UNKNOWN = "UNKNOWN",
    ART_WALLET = "ART_WALLET",
    OPIUM_WALLET = "OPIUM_WALLET",
    OFI_WALLET = "OFI_WALLET"
}
export declare type PersistentSession = {
    providerName: ProviderName;
    providerType: ProviderType;
    address: string;
};
export declare class IBlockchain {
    protected _web3: Web3 | null;
    protected _provider: any | null;
    protected _web3ws: Web3;
    protected _subscription: Subscription<BlockHeader> | null;
    protected _log: any;
    protected _injectedWalletChangesRefreshTime: number;
    protected _networkId: number;
    providerName: ProviderName | null;
    providerType: ProviderType | null;
    clientName: ClientName;
    protected _web3Modal: Web3Modal;
    private _periodicalCheckIntervalId;
    web3Connected: boolean;
    address: string;
    private _logoutCallback;
    get correctNetwork(): boolean;
    get currentNetworkName(): string;
    get requiredNetworkName(): string;
    constructor(networkId: number, networkName: string, infuraId: string, fortmaticKey: string, infuraWs: string, logger: any);
    toggleWeb3Modal(): Promise<void>;
    connectTo(authType: AuthType): Promise<any>;
    registerWeb3ModalOnConnectCallback(callback: () => void): Promise<void>;
    registerLogoutCallback(callback: () => void): void;
    getWeb3(): Web3 | null;
    watchTx: (txHash: string) => Promise<void>;
    signTypedData(data: any): Promise<string>;
    private _signTypedData;
    private _signTypedDataReversed;
    private _signTypedDataV3;
    clearWallet(): void;
    subscribeNewBlockHeaders: (_callback: () => void) => void;
    unsubscribeNewBlockHeaders(): void;
    private _initWeb3Modal;
    private _initWeb3;
}
