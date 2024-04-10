# `@web3inbox/core`

Web3Inbox Core is a client wrapper over [Notify Client](https://github.com/WalletConnect/notify-client-js). It manages state of subscriptions and notifications, as well as multiple helper functions to ease the use of notify client and easily paging notifications of a subscription.

## Basic Usage

```typescript
import { Web3InboxClient } from "@web3inbox/core";
import { signMessage } from "@wagmi/core";

const client = await Web3InboxClient.init({
  projectId: "<YOUR_PROJECT_ID>",
  domain: window.location.host,
});

const account = `eip155:1:0x...`;

await client.setAccount(account);

const { message, registerParams } = await client.prepareRegistration({
  account,
});

const signature = await signMessage(message);

await client.register({ registerParams, signature });

await client.subscribeToDapp();
```

Read more in the [docs](https://docs.walletconnect.com/web3inbox/frontend-integration/api?platform=javascript)
