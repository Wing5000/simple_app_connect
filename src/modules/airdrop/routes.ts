import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { estimateChunkFee, submitRequest } from './service.js';
import { enqueueAirdrop } from '../../queue/queue.js';
import { prisma } from '../../services/prisma.js';
import { maybeEncryptResponse } from '../../utils/crypto.js';

export function registerAirdropRoutes(app: FastifyInstance) {
  app.post('/api/airdrop/estimate', async (req, reply) => {
    const schema = z.object({
      token: z.string(),
      decimals: z.number().int().min(0).max(36),
      recipients: z.array(z.object({ address: z.string(), amountHuman: z.string() })).min(1),
    });
    const body = schema.parse(req.body);
    const fee = await estimateChunkFee(body.token, body.decimals, body.recipients);
    return maybeEncryptResponse(reply.send({ suggestedMaxFee: fee.toString() }));
  });

  app.post('/api/airdrop/submit', async (req, reply) => {
    const schema = z.object({
      token: z.string(),
      decimals: z.number().int().min(0).max(36),
      recipients: z.array(z.object({ address: z.string(), amountHuman: z.string() })).min(1),
      chunkSize: z.number().int().min(1).max(500).optional(),
      submittedBy: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const id = await submitRequest(body.token, body.decimals, body.recipients, body.chunkSize ?? 50, body.submittedBy);
    await enqueueAirdrop(id);
    return maybeEncryptResponse(reply.send({ id }));
  });

  app.get('/api/airdrop/:id/status', async (req, reply) => {
    const { id } = req.params as any;
    const reqRow = await prisma.airdropRequest.findUnique({ where: { id } });
    if (!reqRow) return reply.code(404).send({ error: 'not_found' });
    const counts = await prisma.airdropRecipient.groupBy({
      by: ['status'],
      where: { requestId: id },
      _count: { _all: true }
    });
    const summary = counts.reduce((acc: Record<string, number>, c: any) => {
      acc[c.status] = c._count._all;
      return acc;
    }, {} as Record<string, number>);
    return maybeEncryptResponse(reply.send({ request: reqRow, summary }));
  });

  app.get('/api/airdrop/:id/recipients', async (req, reply) => {
    const { id } = req.params as any;
    const { status, take = '100', skip = '0' } = (req.query as any) ?? {};
    const where: any = { requestId: id };
    if (status) where.status = status;
    const rows = await prisma.airdropRecipient.findMany({ where, take: Number(take), skip: Number(skip), orderBy: { createdAt: 'asc' } });
    return maybeEncryptResponse(reply.send({ rows }));
  });
}
