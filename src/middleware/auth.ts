import { FastifyReply, FastifyRequest } from 'fastify';

export async function authHook(req: FastifyRequest, reply: FastifyReply) {
  if (req.url.startsWith('/health')) return; // bez auth
  const key = req.headers['x-api-key'];
  if (!process.env.API_KEY || key !== process.env.API_KEY) {
    reply.code(401).send({ error: 'unauthorized' });
  }
}
