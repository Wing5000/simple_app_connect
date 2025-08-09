export const ERC20_ABI = [
  { name: 'transfer', type: 'function', inputs: [
      { name: 'recipient', type: 'felt' },
      { name: 'amount', type: 'Uint256' }
    ], outputs: []
  },
  { name: 'balanceOf', type: 'function', inputs: [ { name: 'account', type: 'felt' } ], outputs: [ { name: 'balance', type: 'Uint256' } ] },
  { name: 'balance_of', type: 'function', inputs: [ { name: 'account', type: 'felt' } ], outputs: [ { name: 'balance', type: 'Uint256' } ] },
  { name: 'decimals', type: 'function', inputs: [], outputs: [ { name: 'decimals', type: 'felt' } ] }
] as const;
