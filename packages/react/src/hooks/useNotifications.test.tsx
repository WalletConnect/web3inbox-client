"use client";

import { connect } from "@wagmi/core";
import { beforeAll, expect, test } from "vitest";
import { config } from "../test/config";

import { waitFor, renderHook, render, WagmiWrapper } from "../test/react";
import { WagmiProvider, useSignMessage } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initWeb3InboxClient } from "../utils";

const connector = config.connectors[0]!;

beforeAll(() => {
  initWeb3InboxClient({
    projectId: "df639b5df61c997b9e9be51c802bc5de",
    domain: "w3m-dapp.vercel.app",
    allApps: true,
  });

});

export const queryClient = new QueryClient();

test("should fetch the new notification", async () => {
  await connect(config, { connector });


  const Comp = () => {

    return (
      <div>
      </div>
    )
  }

  const { result }  = render(<Comp />, {
			       wrapper: ({children}: {children: React.ReactNode}) => {
				 return (
				   <WagmiProvider config={config}>
				   <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
				   </WagmiProvider>
				 )

			       }
			     }
  )

  console.log({result})

  // const { result } = renderHook(() => useSignMessage());
  // result.current.signMessage({ message: "foo bar baz" });
  // await waitFor(() => expect(result.current.isSuccess).toBe(true));
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
