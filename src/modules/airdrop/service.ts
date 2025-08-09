import { Account, Call, Contract, RpcProvider } from 'starknet';
import { prisma } from '../../services/prisma.js';
import { getAccount, getProvider } from '../../services/starknet.js';
import { ERC20_ABI } from './abi/erc20.js';
import { bigintToUint256, parseAmountToWei } from '../../utils/u256.js';

export type RecipientInput = { address: string; amountHuman: string };

type AirdropRecipientRow = { id: string; address: string; amountWei: string };

export function getErc20(tokenAddress: string, provider?: RpcProvider | Account) {
  return new Contract(ERC20_ABI as any, tokenAddress, provider ?? getProvider());
}

export async function estimateChunkFee(token: string, decimals: number, items: RecipientInput[]) {
  const account = getAccount();
  const calls: Call[] = items.map((it) => {
    const wei = parseAmountToWei(it.amountHuman, decimals);
    const u = bigintToUint256(wei);
    return { contractAddress: token, entrypoint: 'transfer', calldata: [it.address, u.low, u.high] } as Call;
  });
  const { suggestedMaxFee } = await account.estimateInvokeFee(calls);
  return suggestedMaxFee; // bigint
}

export async function submitRequest(
  token: string,
  decimals: number,
  recipients: RecipientInput[],
  chunkSize = 50,
  submittedBy?: string,
) {
  const totalRecipients = recipients.length;
  const req = await prisma.airdropRequest.create({
    data: { tokenAddress: token, decimals, chunkSize, totalRecipients, submittedBy }
  });
  await prisma.airdropRecipient.createMany({
    data: recipients.map((r) => ({
      requestId: req.id,
      address: r.address,
      amountWei: parseAmountToWei(r.amountHuman, decimals).toString(),
    }))
  });
  return req.id;
}

export async function processRequestOnce(requestId: string, log: any) {
  const account = getAccount();
  const req = await prisma.airdropRequest.findUnique({ where: { id: requestId } });
  if (!req) throw new Error('Request not found');
  if (req.status === 'COMPLETED') return;
  await prisma.airdropRequest.update({ where: { id: requestId }, data: { status: 'RUNNING' } });

  const batch: AirdropRecipientRow[] = await prisma.airdropRecipient.findMany({
    where: { requestId, status: { in: ['QUEUED', 'FAILED'] } },
    take: req.chunkSize,
    orderBy: { createdAt: 'asc' }
  });
  if (batch.length === 0) {
    await prisma.airdropRequest.update({ where: { id: requestId }, data: { status: 'COMPLETED' } });
    return;
  }

  const calls: Call[] = batch.map((r: AirdropRecipientRow) => {
    const u = bigintToUint256(BigInt(r.amountWei));
    return { contractAddress: req.tokenAddress, entrypoint: 'transfer', calldata: [r.address, u.low, u.high] } as Call;
  });

  try {
    const estimate = await account.estimateInvokeFee(calls);
    const maxFee = (estimate.suggestedMaxFee * 12n) / 10n; // +20%
    const res = await account.execute(calls, { maxFee });

    // Oznacz submitted
    await prisma.airdropRecipient.updateMany({
      where: { id: { in: batch.map((b: AirdropRecipientRow) => b.id) } },
      data: { status: 'SUBMITTED', txHash: res.transaction_hash }
    });

    // Poczekaj na potwierdzenie transakcji
    await getProvider().waitForTransaction(res.transaction_hash);

    await prisma.airdropRecipient.updateMany({
      where: { id: { in: batch.map((b: AirdropRecipientRow) => b.id) } },
      data: { status: 'CONFIRMED' }
    });

    await prisma.airdropRequest.update({
      where: { id: requestId },
      data: { txCount: { increment: 1 } }
    });
  } catch (err: any) {
    log.error({ err }, 'Batch failed');
    await Promise.all(batch.map((r: AirdropRecipientRow) => prisma.airdropRecipient.update({ where: { id: r.id }, data: { status: 'FAILED', error: String(err?.message ?? err) } })));
    await prisma.airdropRequest.update({ where: { id: requestId }, data: { error: String(err?.message ?? err) } });
    throw err;
  }
}
