"use client";

import { connect } from "@wagmi/core";
import { expect, test } from "vitest";
import { config } from "../test/config";

import { waitFor, renderHook } from "../test/react";
import { Fragment, useEffect } from "react";
import { WagmiProvider, useSignMessage } from "wagmi";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { render } from "@testing-library/react";

const connector = config.connectors[0]!;

// beforeAll(() => {
//   initWeb3InboxClient({
//     projectId: "df639b5df61c997b9e9be51c802bc5de",
//     domain: "w3m-dapp.vercel.app",
//     allApps: true,
//   });
// });

async function sendNotification() {
  await fetch(`https://sdfsdfsdfsd/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer e46e473b-64cb-4019-adae-e2e4fc77371f`,
    },
    body: JSON.stringify({
      accounts: ["eip155:1:0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831"],
      notification: {
        title: `jsdom ${new Date().getTime()}`,
        body: "test notification from jsdom - description",
        icon: "https://emojiisland.com/cdn/shop/products/4_large.png?v=1571606116",
        url: "https://ozturkenes.com",
        type: "ab137d9e-2836-48a5-aa83-a00afcd67a73",
      },
    }),
  });
}

export const queryClient = new QueryClient();

function Container({ children }: { children: Element }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

function ExampleComp() {
  // const { signMessage } = useSignMessage();
  const { mutate, isSuccess } = useMutation({
    mutationFn: sendNotification,
  });

  useEffect(() => {
    mutate();
    // signMessage({ message: "foo bar baz" });
  }, []);

  return <div>{isSuccess ? "success" : "-"}</div>;
}

test("should fetch the new notification", async () => {
  await connect(config, { connector });
  const { result } = renderHook(() => useSignMessage());
  // const { container, findByText } = render(<ExampleComp />, {
  //   wrapper: ({ children }) => <Container>{children}</Container>,
  // });

  // result.current.signMessage({ message: "foo bar baz" });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  // expect(baseElement).toBe(null);

  // const { result: clientResult } = renderHook(() => useWeb3InboxClient());

  // await vi.waitUntil(() => clientResult.current.data !== null, {
  //   timeout: 5000,
  //   interval: 100,
  // });

  // const { result: manageSubscriptionResult } = renderHook(() =>
  //   useManageSubscription(
  //     "eip155:1:0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831",
  //     "w3m-dapp.vercel.app"
  //   )
  // );

  // expect(manageSubscriptionResult.current.data?.isSubscribing).equal(false);

  // manageSubscriptionResult.current.subscribe();

  // expect(manageSubscriptionResult.current.data?.isSubscribing).equal(false);

  // await vi.waitUntil(
  //   () => manageSubscriptionResult.current.isLoading !== false,
  //   {
  //     timeout: 5000,
  //     interval: 100,
  //   }
  // );

  // const { result } = renderHook(() =>
  //   useNotifications(
  //     10,
  //     false,
  //     "eip155:1:0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831",
  //     "w3m-dapp.vercel.app",
  //     clientResult.current.data?.client
  //   )
  // );

  // expect(result.current.data?.notifications).toBe(undefined);
  // expect(result.current.error).toBe(null);

  // await sendNotification();

  // expect(result.current.data?.notifications?.length).toEqual(0);

  // await vi.waitUntil(
  //   () => {
  //     return (
  //       result.current.data?.notifications &&
  //       result.current.data?.notifications?.length > 0
  //     );
  //   },
  //   {
  //     timeout: 12000,
  //     interval: 1000,
  //   }
  // );

  // expect(result.current.data?.notifications?.length).toBeGreaterThan(0);
});
