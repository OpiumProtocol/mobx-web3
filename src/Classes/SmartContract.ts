// Theirs
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
// Constants
import IERC20_ABI from '../Constants/ABI/IERC20.json'

import Blockchain from './Blockchain'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export default class SmartContract {
  protected _web3: Web3
  protected _contract: Contract
  protected _log: any
  protected _blockchain: Blockchain

  constructor(jsonInterface: AbiItem[], address: string, blockchain: Blockchain, logger: any) {
    this._blockchain = blockchain
    this._log = logger
    const web3 = this._blockchain.getWeb3()
    if (web3 === null) {
      throw new Error('Web3 is not initialized')
    }

    this._web3 = web3
    this._contract = new web3.eth.Contract(jsonInterface, address)
  }
}

export class IERC20 extends SmartContract {
  constructor(address: string, blockchain: Blockchain, logger: any) {
    super(IERC20_ABI as AbiItem[], address, blockchain, logger)
  }

  public approve(spender: string, confirmationCallback: () => void): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const tx = this._contract.methods.approve(spender, MAX_UINT256).send({ from: this._blockchain.address })
        let confirmationSent = false

        tx.on('confirmation', () => {
          if (!confirmationSent) {
            confirmationCallback()
            confirmationSent = true
          }
        })
        tx.on('transactionHash', resolve)
        tx.on('error', reject)
      } catch (e) {
        reject(e)
      }
    })
  }
}
