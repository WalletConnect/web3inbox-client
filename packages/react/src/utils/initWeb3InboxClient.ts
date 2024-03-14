import { Web3InboxClient, Web3InboxClientInitOptions } from "@web3inbox/core";

/**
 * Init a singleton instance of the Web3InboxClient
 *
 * @param {Object} params - the params needed to init the client
 * @param {string} params.projectId - your WalletConnect Cloud project ID
 * @param {string} params.domain - The domain of the default dapp to target for functions.
 * @param {boolean} params.allApps - All account's subscriptions accessable if explicitly set to true. Only param.domain's otherwise
 */
export const initWeb3InboxClient = (options: Web3InboxClientInitOptions) => {
  return Web3InboxClient.init(options);
};
