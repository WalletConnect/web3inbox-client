const fetchByteCodeFromRpc = async (
  address: string,
  chainId: string,
  rpcUrlBuilder: (chainId: string) => string
): Promise<{ result: string }> => {
  const rpcUrl = rpcUrlBuilder(chainId);
  try {
    const result = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getCode",
        params: [address, "latest"],
        id: Date.now(),
      }),
    }).then((response) => response.json());

    return result;
  } catch (e: any) {
    throw new Error(
      `Failed to fetch bytecode of address ${address} from RPC ${rpcUrl}. Error: ${e.message}`
    );
  }
};

export const isSmartWallet = async (
  address: string,
  chainId: string,
  rpcUrlBuilder: (chainId: string) => string
) => {
  const { result: bytecode } = await fetchByteCodeFromRpc(
    address,
    chainId,
    rpcUrlBuilder
  );

  const nonContractBytecode =
    !bytecode || bytecode === "0x" || bytecode === "0x0" || bytecode === "0x00";

  return !nonContractBytecode;
};
