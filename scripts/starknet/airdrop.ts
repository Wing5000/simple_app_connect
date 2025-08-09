import 'dotenv/config';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { StarknetAdapter } from '../../src/chains/starknet/StarknetAdapter';
import { parseAmountHumanToWei } from '../../src/chains/starknet/u256';

(async () => {
  const argv = yargs(hideBin(process.argv))
    .option('csv', { type: 'string', demandOption: true })
    .option('chunkSize', { type: 'number', default: Number(process.env.DEFAULT_BATCH_SIZE || 25) })
    .option('units', { type: 'string', choices: ['human', 'wei'], default: 'human' })
    .option('out', { type: 'string', default: 'starknet_airdrop_result.csv' })
    .parseSync();

  const adapter = new StarknetAdapter({ chainId: process.env.STARKNET_CHAIN_ID });
  const decimals = await adapter.getDecimals();
  const csv = fs.readFileSync(String(argv.csv), 'utf8');
  const rows: Array<{ address: string; amount: string }> = parse(csv, { columns: true, skip_empty_lines: true });

  const items = rows.map((r) => {
    const addr = String(r.address).trim();
    const amt = String(r.amount).trim();
    const amountWei = argv.units === 'wei' ? BigInt(amt) : parseAmountHumanToWei(amt, decimals);
    return { to: addr, amountWei };
  });

  console.log(`Start airdropu: recipients=${items.length}, chunkSize=${argv.chunkSize}, token=${process.env.STARKNET_TOKEN_ADDRESS}`);
  const txs = await adapter.batchTransferErc20(items, Number(argv.chunkSize));
  console.log('Wysłane transakcje:', txs);

  // zapis wyników (po 1 linii per tx)
  const lines = ['batch_index,txHash'];
  txs.forEach((tx, i) => lines.push(`${i},${tx}`));
  fs.writeFileSync(String(argv.out), lines.join('\n'));
  console.log(`Zapisano: ${String(argv.out)}`);
})();

