import { Web3InboxClient } from "@web3inbox/core";
import {
  version as web3inboxReactPackageVersion,
  name as web3inboxReactPackageName,
} from "../../package.json";

interface IInitWeb3InboxClient {
  projectId: string;
  domain?: string;
  allApps?: boolean;
  logLevel?: "info" | "error" | "debug" | "trace";
  rpcUrlBuilder?: (chainId: string) => string;
}

/**
 * Init a singleton instance of the Web3InboxClient
 *
 * @param {Object} params - the params needed to init the client
 * @param {string} params.projectId - your WalletConnect Cloud project ID
 * @param {string} params.domain - The domain of the default dapp to target for functions.
 * @param {boolean} params.allApps - All account's subscriptions accessable if explicitly set to true. Only param.domain's otherwise
 */
export const initWeb3InboxClient = ({
  projectId,
  domain,
  allApps,
  logLevel,
  rpcUrlBuilder,
}: IInitWeb3InboxClient) => {
  return Web3InboxClient.init({
    projectId,
    domain,
    allApps,
    logLevel,
    rpcUrlBuilder,
    sdkVersionMapEntries: {
      [web3inboxReactPackageName]: web3inboxReactPackageVersion,
    },
  });
};
