export let walletConnectProjectId: string;
if (process.env.VITE_WC_PROJECT_ID)
  walletConnectProjectId = process.env.VITE_WC_PROJECT_ID;
else walletConnectProjectId = "foobarbaz";

export const TEST_ACCOUNT_1 = "testAccount";
export const TEST_DAPP_1 = "w3m-dapp.vercel.app";
