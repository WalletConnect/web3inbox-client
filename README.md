# Web3Inbox Widget
Adds a convenient widget to any dapp that wants to use the functionalities of push and chat without
any of the hassle.

## Versioning and publishing

At the root of the project run the following commands

1. Choose the packages you want to update and add a summary.

```sh
yarn changeset
```

2. Version your latest change(s)

```sh
yarn changeset version
```

3. Publish your package(s)

```sh
yarn changeset publish
```

Refer to [changesets docs](https://github.com/changesets/changesets/tree/main#documentation) for more information.


# Using the widget
## React

### Normal use case

```tsx
import { W3iWidget } from "@web3inbox/react-widget";
import "@web3inbox/widget-react/dist/compiled.css";
...

<W3iWidget
    account="ep155:1:0xd7..."
    onSign={() => {}}
    onConnect={() => {}}
</W3iContext>
```

