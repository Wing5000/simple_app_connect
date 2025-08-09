import 'dotenv/config';
import Fastify from 'fastify';
import { authHook } from './middleware/auth.js';
import { registerAirdropRoutes } from './modules/airdrop/routes.js';
import { connectQueue } from './queue/queue.js';
import { prisma } from './services/prisma.js';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true }));

app.addHook('onRequest', authHook);

registerAirdropRoutes(app);

const port = Number(process.env.PORT || 8080);

(async () => {
  await connectQueue(app.log);
  await prisma.$connect();
  await app.listen({ port, host: '0.0.0.0' });
})();
