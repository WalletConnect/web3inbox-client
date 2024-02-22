const fetchByteCodeFromRpc = async (address: string, chainId: string, projectId: string, rpcUrl: string): Promise<{result: string}> => {
  try {
    const result = await fetch(`${rpcUrl}?chainId=${chainId}&projectId=${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [address, 'latest'],
        id: Date.now(),
      }),
    })
    .then(response => response.json())

    return result;
  }
  catch (e) {
    throw new Error(`Failed to fetch bytecode of address ${address} from RPC ${rpcUrl}`)
  }
}

export const isSmartWallet = async (address: string, chainId: string, projectId: string, rpcUrl: string) => {
  const { result: bytecode } = await fetchByteCodeFromRpc(address, chainId, projectId, rpcUrl)

  const nonContractBytecode = !bytecode || bytecode === '0x' || bytecode === '0x0' || bytecode === '0x00';

  return !nonContractBytecode;
}
