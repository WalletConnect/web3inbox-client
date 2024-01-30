# `@web3inbox/react`

Web3Inbox React provides hook wrappers over [@web3inbox/core](https://github.com/WalletConnect/web3inbox-client). It manages state
of subscriptions and notifications, as well as multiple helper functions to ease the use of notify client and easily paging
notifications of a subscription.

## Basic Usage 

```typescript
import { initWeb3InboxClient } from "@web3inbox/core"
import { signMessage } from "@wagmi/core"

const client = await initWeb3InboxClient({
  projectId: "<YOUR_PROJECT_ID>",
  domain: window.location.host
})

const account = `eip155:1:0x...`

useWeb3InboxAccount(account)

const { prepareRegistration } = usePrepareRegistration()
const { register } = useRegister()

const { subscribe } = useSubscribe()

const { message, registerParams } = await prepareRegistration({ account });

const signature = await signMessage(message)

await register({ registerParams, signature })

await subscribe();
```

Read more in the [docs](https://docs.walletconnect.com/web3inbox/frontend-integration/api?platform=react)

Check out the example implementation [here](https://github.com/WalletConnect/web3inbox-client/tree/main/apps/web)
