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
    .parseSync();

  const adapter = new StarknetAdapter();
  const csv = fs.readFileSync(String(argv.csv), 'utf8');
  const rows: Array<{ address: string; amount: string }> = parse(csv, { columns: true, skip_empty_lines: true });
  const decimals = await adapter.getDecimals();

  const items = rows.map((r) => {
    const addr = String(r.address).trim();
    const amt = String(r.amount).trim();
    const amountWei = argv.units === 'wei' ? BigInt(amt) : parseAmountHumanToWei(amt, decimals);
    return { to: addr, amountWei };
  });

  const chunks = Math.ceil(items.length / Number(argv.chunkSize));
  console.log(`Recipients: ${items.length}`);
  console.log(`Chunk size: ${argv.chunkSize}, chunks: ${chunks}`);
  console.log(`Token decimals: ${decimals}`);
  console.log('To jest tylko estymacja — finalny fee policzy node przy wykonaniu.');
})();

