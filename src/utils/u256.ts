import { uint256 } from 'starknet';

export function pow10(decimals: number): bigint {
  return BigInt(10) ** BigInt(decimals);
}

export function parseAmountToWei(amountHuman: string, decimals: number): bigint {
  const [intPart, fracPartRaw] = amountHuman.split('.');
  const fracPart = (fracPartRaw ?? '').padEnd(decimals, '0').slice(0, decimals);
  const bigIntInt = BigInt(intPart || '0');
  const bigIntFrac = BigInt(fracPart || '0');
  return bigIntInt * pow10(decimals) + bigIntFrac;
}

export function bigintToUint256(bn: bigint) {
  return uint256.bnToUint256(bn);
}

export function asHex(num: bigint): string {
  return '0x' + num.toString(16);
}
