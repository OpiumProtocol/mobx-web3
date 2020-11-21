import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { IBlockchain } from '../Constants/Types/blockchain';
export default class SmartContract {
    protected _web3: Web3;
    protected _contract: Contract;
    protected _log: any;
    protected _blockchain: IBlockchain;
    constructor(jsonInterface: AbiItem[], address: string, blockchain: IBlockchain, logger: any);
}
export declare class IERC20 extends SmartContract {
    constructor(address: string, blockchain: IBlockchain, logger: any);
    approve(spender: string, confirmationCallback: () => void): Promise<string>;
}
