export const cfg = {
  apiKey: process.env.API_KEY ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
  rpcUrl: process.env.STARKNET_RPC_URL ?? '',
  network: process.env.STARKNET_NETWORK ?? 'sepolia',
  accountAddress: process.env.STARKNET_ACCOUNT_ADDRESS ?? '',
  privateKey: process.env.STARKNET_PRIVATE_KEY ?? '',
  kmsProvider: process.env.KMS_PROVIDER ?? '',
  kmsKeyId: process.env.KMS_KEY_ID ?? '',
};
