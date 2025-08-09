export type Uint256 = { low: string; high: string };

const MASK_128 = (1n << 128n) - 1n;

export function toUint256(x: bigint): Uint256 {
  const low = x & MASK_128;
  const high = x >> 128n;
  return { low: '0x' + low.toString(16), high: '0x' + high.toString(16) };
}

export function fromUint256(u: Uint256): bigint {
  const low = BigInt(u.low);
  const high = BigInt(u.high);
  return (high << 128n) + low;
}

/** "123.45" -> bigint (najmniejsze jednostki), pozwala też na hexa "0x..." */
export function parseAmountHumanToWei(amountHuman: string, decimals: number): bigint {
  const trimmed = amountHuman.trim();
  if (/^0x/i.test(trimmed)) return BigInt(trimmed); // hexa jako wei
  if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error(`Invalid amount: ${amountHuman}`);
  const [intPart, fracRaw = ''] = trimmed.split('.');
  const frac = (fracRaw + '0'.repeat(decimals)).slice(0, decimals);
  const s = (intPart.replace(/^0+/, '') || '0') + frac;
  return BigInt(s);
}

