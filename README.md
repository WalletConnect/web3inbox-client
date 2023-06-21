# Web3Inbox Widget
Adds a convenient widget to any dapp that wants to use the functionalities of push and chat without
any of the hassle.


# Using the widget
## React

### Normal use case

```tsx
import { W3iWidget, W3iContext } from "@web3inbox/react-widget";
...

<W3iContext>
  <W3iWidget
    account="0xd7..."
  />
</W3iContext>
```

### Cherry-picking UI
```tsx
import { W3iWidget, W3iContext } from "@web3inbox/react-widget";
...

// Effectively a push only UI
<W3iContext>
  <W3iWidget
    account="0xd7..."
    chatEnabled={false}
    settingsEnabled={false}
  />
</W3iContext>
```






