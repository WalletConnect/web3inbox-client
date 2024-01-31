# Web3Inbox Client

Adds a convenient client to any dapp that wants to use the functionalities of push and chat without
any of the hassle.

- 📚 [Documentation](https://docs.walletconnect.com/web3inbox/about)

- 🧪 [Hooks Playground](https://lab.web3inbox.com)

- 🔗 [Website](https://web3inbox.com)

## Development

To start contributing to the packages, all you need to do is installing dependencies and running `dev` script. This will build & watch the all packages including the web app.

```sh
yarn install
yarn dev
```

You'll see that the packages are got built and lastly the web app started running on `3000` port. You can open the `localhost:3000` and start testing the client and hooks.

Once you make changes to any of the packages, it'll re-build them again and web app will be refreshed.

## Versioning and publishing

To create new version of the packages, follow the steps below. Make sure that you're running the scripts on the root of the repository.

### Choose the packages you want to update and add a summary.

```sh
yarn changeset
```

### Version your latest change(s)

```sh
yarn changeset version
```

### Publish your package(s)

```sh
yarn changeset publish
```

Refer to [changesets docs](https://github.com/changesets/changesets/tree/main#documentation) for more information.
