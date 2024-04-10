# Sample For Hooks

This is an example application designed to demonstrate the integration of `@web3inbox/hooks` for interacting with the Notify API.

The app serves as a practical guide and reference for developers looking to understand how to effectively use Web3Inbox Hooks within their projects.

### Built with

- Next.js
- Web3Inbox Hooks
- Wagmi v2
- Chakra UI

## Install Dependencies

First, you need to install the project's dependencies. Open your terminal, navigate to the project directory, and run the following command:

```bash
yarn install
```

## Add .env.local File

Before running the application, you must create a `.env` file in the root directory of your project with the following keys. It's recommended to copy them from the `.env.example` file that you can find in the root of the project.

Visit [Cloud](https://cloud.walletconnect.com/app) to get your keys.

```sh
NEXT_PUBLIC_PROJECT_ID=
NOTIFY_API_SECRET=
NEXT_PUBLIC_APP_DOMAIN=
```

## Run the Development Server

Once the dependencies are installed, and the .env.local file is set up with your PROJECT_ID, you can start the development server by running:

```bash
yarn dev
```
