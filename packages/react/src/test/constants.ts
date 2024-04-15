export let walletConnectProjectId: string;
if (process.env.VITE_WC_PROJECT_ID)
  walletConnectProjectId = process.env.VITE_WC_PROJECT_ID;
else walletConnectProjectId = "foobarbaz";
