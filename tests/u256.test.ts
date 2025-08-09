import { expect } from 'chai';
import { toUint256, fromUint256, parseAmountHumanToWei } from '../src/chains/starknet/u256';

describe('u256 helpers', () => {
  it('toUint256/fromUint256 roundtrip', () => {
    const x = (1n << 200n) + 12345n;
    const u = toUint256(x);
    expect(fromUint256(u)).to.equal(x);
  });

  it('parseAmountHumanToWei decimal', () => {
    expect(parseAmountHumanToWei('1.23', 2)).to.equal(123n);
    expect(parseAmountHumanToWei('0.001', 6)).to.equal(1000n);
  });

  it('parseAmountHumanToWei hex', () => {
    expect(parseAmountHumanToWei('0x10', 18)).to.equal(16n);
  });

  it('parseAmountHumanToWei invalid', () => {
    expect(() => parseAmountHumanToWei('abc', 2)).to.throw('Invalid amount');
  });
});

