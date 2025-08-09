import 'dotenv/config';
import { RpcProvider, Account, Contract, validateAndParseAddress } from 'starknet';
import erc20Abi from './erc20_abi.cairo.json';
import { toUint256, Uint256 } from './u256';

type Call = { contractAddress: string; entrypoint: string; calldata: Array<string> };

export class StarknetAdapter {
  provider: RpcProvider;
  account: Account;
  tokenAddress: string;

  constructor(cfg?: {
    rpcUrl?: string;
    accountAddress?: string;
    privateKey?: string;
    tokenAddress?: string;
    chainId?: string;
  }) {
    const rpcUrl = cfg?.rpcUrl ?? process.env.STARKNET_RPC_URL!;
    const accountAddress = cfg?.accountAddress ?? process.env.STARKNET_ACCOUNT_ADDRESS!;
    const privateKey = cfg?.privateKey ?? process.env.STARKNET_PRIVATE_KEY!;
    this.tokenAddress = cfg?.tokenAddress ?? process.env.STARKNET_TOKEN_ADDRESS!;
    const chainId = cfg?.chainId ?? process.env.STARKNET_CHAIN_ID;

    if (!rpcUrl || !accountAddress || !privateKey || !this.tokenAddress || !chainId) {
      throw new Error(
        'Missing Starknet env: STARKNET_RPC_URL, STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY, STARKNET_TOKEN_ADDRESS, STARKNET_CHAIN_ID'
      );
    }

    this.provider = new RpcProvider({ nodeUrl: rpcUrl, chainId: chainId as any });
    const accAddrParsed = validateAndParseAddress(accountAddress);
    this.tokenAddress = validateAndParseAddress(this.tokenAddress);
    this.account = new Account({ nodeUrl: rpcUrl, chainId: chainId as any }, accAddrParsed, privateKey);
  }

  private erc20Read(): Contract {
    return new Contract(erc20Abi as any, this.tokenAddress, this.provider);
  }

  async getDecimals(): Promise<number> {
    const c = this.erc20Read();
    const res: any = await c.decimals();
    const d = res?.decimals ?? res;
    const n = typeof d === 'bigint' ? Number(d) : Number(d);
    return Number.isFinite(n) ? n : 18;
  }

  async getBalanceOf(wallet: string): Promise<bigint> {
    const addr = validateAndParseAddress(wallet);
    const c = this.erc20Read();
    const { balance } = await c.balance_of(addr);
    const low = BigInt(typeof balance.low === 'string' ? balance.low : balance.low.toString());
    const high = BigInt(typeof balance.high === 'string' ? balance.high : balance.high.toString());
    return (high << 128n) + low;
  }

  private buildTransferCall(to: string, amount: Uint256): Call {
    const addr = validateAndParseAddress(to);
    return {
      contractAddress: this.tokenAddress,
      entrypoint: 'transfer',
      calldata: [addr, amount.low, amount.high],
    };
  }

  private async waitForL2(txHash: string): Promise<void> {
    await this.provider.waitForTransaction(txHash);
  }

  async transferErc20(to: string, amountWei: bigint): Promise<string> {
    const call = this.buildTransferCall(to, toUint256(amountWei));
    let suggestedMaxFee: bigint;
    try {
      const fee: any = await this.account.estimateInvokeFee([call]);
      suggestedMaxFee = BigInt(fee?.suggestedMaxFee ?? fee?.overall_fee ?? 0n);
      if (suggestedMaxFee <= 0n) throw new Error('Bad fee');
    } catch {
      // Fallback — dopasuj do swojej polityki
      suggestedMaxFee = 10n ** 15n;
    }
    const maxFee = (suggestedMaxFee * 15n) / 10n; // +50% bufor
    const { transaction_hash } = await this.account.execute([call], { maxFee });
    await this.waitForL2(transaction_hash);
    return transaction_hash;
  }

  async batchTransferErc20(
    items: Array<{ to: string; amountWei: bigint }>,
    chunkSize = Number(process.env.DEFAULT_BATCH_SIZE || 25)
  ): Promise<string[]> {
    const txs: string[] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      let localChunkSize = Math.max(1, chunkSize);
      let sent = false;
      while (!sent) {
        const chunk = items.slice(i, Math.min(i + localChunkSize, items.length));
        const calls = chunk.map((it) => this.buildTransferCall(it.to, toUint256(it.amountWei)));
        let maxFee: bigint;
        try {
          const fee: any = await this.account.estimateInvokeFee(calls);
          const feeRaw = BigInt(fee?.suggestedMaxFee ?? fee?.overall_fee ?? 0n);
          maxFee = (feeRaw * 15n) / 10n; // +50%
          if (maxFee <= 0n) throw new Error('Bad fee');
        } catch {
          maxFee = (10n ** 14n) * BigInt(localChunkSize);
        }

        try {
          const { transaction_hash } = await this.account.execute(calls, { maxFee });
          await this.waitForL2(transaction_hash);
          txs.push(transaction_hash);
          sent = true;
          // opcjonalny log
          // console.log(`Batch sent: size=${localChunkSize}, tx=${transaction_hash}`);
        } catch (e: any) {
          const msg = String(e?.message ?? e);
          if (localChunkSize > 1 && /OUT_OF_RESOURCES|INSUFFICIENT|MAX_FEE|RESOURCE|gas/i.test(msg)) {
            localChunkSize = Math.ceil(localChunkSize / 2);
            continue;
          }
          throw e;
        }
      }
    }
    return txs;
  }
}

