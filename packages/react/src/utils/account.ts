/*
 * Convert a did pkh, which looks like: did:pkh:eip155:1:0x... into a CAIP-10
 * @param {string} [didPkh] - didPkh form of account
 */
export const getAccountFromDidPkh = (didPkh: string) => {
  return didPkh.split(":").slice(-3).join(":");
}
