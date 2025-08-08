import { expect } from 'chai';
import { decimalToU256 } from '../src/chains/starknet/u256';

describe('decimalToU256', () => {
  it('parses integer values', () => {
    expect(decimalToU256('123', 2)).to.equal(12300n);
  });

  it('parses decimals with padding', () => {
    expect(decimalToU256('1.23', 4)).to.equal(12300n);
  });

  it('allows extra zero fractional digits', () => {
    expect(decimalToU256('1.2300', 2)).to.equal(123n);
  });

  it('rejects negative numbers', () => {
    expect(() => decimalToU256('-1', 2)).to.throw('Negative');
  });

  it('rejects invalid numeric formats', () => {
    expect(() => decimalToU256('1.2.3', 2)).to.throw('Invalid numeric format');
    expect(() => decimalToU256('abc', 2)).to.throw('Invalid numeric format');
  });

  it('rejects non-zero extra fractional digits', () => {
    expect(() => decimalToU256('1.234', 2)).to.throw('Fractional part exceeds decimals');
  });

  it('handles decimals = 0 correctly', () => {
    expect(decimalToU256('1.000', 0)).to.equal(1n);
    expect(() => decimalToU256('1.001', 0)).to.throw('Fractional part exceeds decimals');
  });

  it('boundary: exactly decimals digits', () => {
    expect(decimalToU256('0.12345', 5)).to.equal(12345n);
  });
});
