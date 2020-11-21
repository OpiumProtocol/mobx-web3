import { EIP712Message, AuthType, IBlockchain } from '../Constants/Types/blockchain';
export declare class BlockchainStore {
    protected _blockchain: IBlockchain;
    protected _log: any;
    subscribeNewBlockHeaders: any;
    watchTx: any;
    get currentNetworkName(): string;
    get correctNetwork(): boolean;
    get address(): string;
    get clientName(): import("../Constants/Types/blockchain").ClientName;
    private _sessionLoadedCallback;
    private _sessionPreparationCallback;
    constructor(blockchain: any, logger: any);
    /** GENERAL */
    registerCallbacks: (sessionLoadedCallback: () => void, sessionPreparationCallback: () => Promise<void>, logoutCallback: () => void) => void;
    /** BLOCKCHAIN ACTIONS */
    /**
     * Calls `approve()` function and tracks transaction
     * @param spender Address of token spender to set
     * @param tokenAddress address of token
     * @param confirmationCallback Callback function, which would be called on first confirmation
     */
    approveToken(tokenAddress: string, spender: string, confirmationCallback: () => void): Promise<string>;
    signTypedMessage(message: EIP712Message): Promise<string>;
    /** WALLET */
    login: (authType: AuthType) => Promise<void>;
    logout: () => void;
    /** PERSISTENT SESSION */
    private _clearPersistentSession;
    savePersistentSession(): void;
    private _loadAndCheckIfWasPersisted;
    private _handleWeb3ConnectOnConnect;
}
export default BlockchainStore;
