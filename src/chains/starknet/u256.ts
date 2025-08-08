export function decimalToU256(value: string, decimals: number): bigint {
  if (typeof value !== 'string') {
    throw new Error('Invalid numeric format');
  }

  const trimmed = value.trim();
  if (trimmed !== value) {
    throw new Error('Invalid numeric format');
  }

  if (trimmed.startsWith('-')) {
    throw new Error('Negative values are not allowed');
  }

  const match = trimmed.match(/^(\d+)(?:\.(\d*))?$/);
  if (!match) {
    throw new Error('Invalid numeric format');
  }

  let [, whole, fracRaw = ''] = match;

  if (fracRaw.length > decimals) {
    const extra = fracRaw.slice(decimals);
    if (/[^0]/.test(extra)) {
      throw new Error('Fractional part exceeds decimals');
    }
    fracRaw = fracRaw.slice(0, decimals);
  }

  const fraction = fracRaw.padEnd(decimals, '0');
  return BigInt(whole + fraction);
}

export default decimalToU256;
