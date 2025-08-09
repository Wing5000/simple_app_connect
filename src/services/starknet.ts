import { Account, RpcProvider, ec } from 'starknet';
import { cfg } from './config.js';

let provider: RpcProvider | null = null;
let account: Account | null = null;

export function getProvider() {
  if (!provider) provider = new RpcProvider({ nodeUrl: cfg.rpcUrl });
  return provider;
}

export function getAccount() {
  if (account) return account;
  if (!cfg.accountAddress) throw new Error('Missing STARKNET_ACCOUNT_ADDRESS');
  if (!cfg.privateKey) throw new Error('Use KMS or set STARKNET_PRIVATE_KEY');
  const pk = cfg.privateKey.startsWith('0x') ? cfg.privateKey : `0x${cfg.privateKey}`;
  account = new Account(getProvider(), cfg.accountAddress, pk);
  return account;
}
