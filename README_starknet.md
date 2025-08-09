# Starknet (Sepolia) – Custodial ERC-20 Airdrop

## Setup
1) `npm i`  
2) `.env` uzupełnij: `STARKNET_RPC_URL`, `STARKNET_ACCOUNT_ADDRESS`, `STARKNET_PRIVATE_KEY`, `STARKNET_TOKEN_ADDRESS`, `STARKNET_CHAIN_ID`.
3) (Opcjonalnie) `npm run build` lub używaj `ts-node`.

## CSV format
address,amount
0x0123...,10.5
0x0abc...,2

`--units human` przelicza po `decimals`; `--units wei` traktuje wartości jako najmniejsze jednostki.

## Dry-run (estymacja)
npm run starknet:estimate -- --csv recipients.csv --chunkSize 25 --units human

## Airdrop
npm run starknet:airdrop -- --csv recipients.csv --chunkSize 25 --units human --out result.csv

Skrypt:
- estymuje fee i dodaje bufor,
- automatycznie zmniejsza `chunkSize`, gdy węzeł zwraca `OUT_OF_RESOURCES/INSUFFICIENT_*`,
- czeka na finalizację L2 dla każdego tx.

## Balance
npm run starknet:balance -- --address 0x... --human

