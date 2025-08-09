import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { StarknetAdapter } from '../../src/chains/starknet/StarknetAdapter';

(async () => {
  const argv = yargs(hideBin(process.argv))
    .option('address', { type: 'string', demandOption: true })
    .option('human', { type: 'boolean', default: true })
    .parseSync();

  const adapter = new StarknetAdapter({ chainId: process.env.STARKNET_CHAIN_ID });
  const bal = await adapter.getBalanceOf(String(argv.address));
  if (argv.human) {
    const d = await adapter.getDecimals();
    const s = bal.toString().padStart(d + 1, '0');
    const human = `${s.slice(0, -d)}.${s.slice(-d)}`.replace(/^\.?0+$/, '0');
    console.log(`Balance: ${human} (decimals=${d})`);
  } else {
    console.log('Balance (wei):', bal.toString());
  }
})();

