"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IERC20 = void 0;
// Constants
const IERC20_json_1 = __importDefault(require("../Constants/ABI/IERC20.json"));
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
class SmartContract {
    constructor(jsonInterface, address, blockchain, logger) {
        this._blockchain = blockchain;
        this._log = logger;
        const web3 = this._blockchain.getWeb3();
        if (web3 === null) {
            throw new Error('Web3 is not initialized');
        }
        this._web3 = web3;
        this._contract = new web3.eth.Contract(jsonInterface, address);
    }
}
exports.default = SmartContract;
class IERC20 extends SmartContract {
    constructor(address, blockchain, logger) {
        super(IERC20_json_1.default, address, blockchain, logger);
    }
    approve(spender, confirmationCallback) {
        return new Promise((resolve, reject) => {
            try {
                const tx = this._contract.methods.approve(spender, MAX_UINT256).send({ from: this._blockchain.address });
                let confirmationSent = false;
                tx.on('confirmation', () => {
                    if (!confirmationSent) {
                        confirmationCallback();
                        confirmationSent = true;
                    }
                });
                tx.on('transactionHash', resolve);
                tx.on('error', reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }
}
exports.IERC20 = IERC20;
