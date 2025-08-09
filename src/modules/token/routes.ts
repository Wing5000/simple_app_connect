import { FastifyInstance } from 'fastify';
import { getErc20 } from '../airdrop/service.js';
import { uint256 } from 'starknet';

export function registerTokenRoutes(app: FastifyInstance) {
  app.get('/api/token/:token/balance/:address', async (req, reply) => {
    const { token, address } = req.params as any;
    const c = getErc20(token);
    // próba balanceOf, a jak nie ma – balance_of
    let res: any;
    try { res = await c.balanceOf(address); } catch { res = await c.balance_of(address); }
    const { low, high } = res.balance ?? res; // zależnie od wersji ABI
    const wei = uint256.uint256ToBN({ low, high });
    return reply.send({ balanceWei: wei.toString() });
  });
}
