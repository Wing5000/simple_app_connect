# simple_app_connect

## Overview
Utility for converting decimal strings to Starknet U256 values and for running custodial ERC-20 airdrop scripts on Starknet.

## Installation
```bash
npm install
```

## Usage
Convert decimal strings to Starknet U256 values:

```ts
import { parseAmountHumanToWei, toUint256 } from './src/chains/starknet/u256';

const wei = parseAmountHumanToWei('1.23', 18);
const u256 = toUint256(wei);
console.log(u256);
```

## Scripts & Starknet airdrop
CLI scripts support fee estimation, airdrop execution and balance checks on Starknet. See [README_starknet.md](README_starknet.md) for full instructions. Common commands:

```bash
npm run starknet:estimate -- --csv recipients.csv --chunkSize 25 --units human
npm run starknet:airdrop  -- --csv recipients.csv --chunkSize 25 --units human --out result.csv
npm run starknet:balance  -- --address 0x... --human
```

## Testing
Run the TypeScript test suite after installing dependencies:

```bash
npm test
```

This compiles the project and executes the Mocha tests. Ensure Node.js and npm are installed.

