import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { useManageSubscription, useW3iAccount, useWeb3InboxClient } from "./";
import { initWeb3InboxClient } from "../utils";
import { renderHook } from "../test/react";

const initialState = {
  data: null,
  error: null,
  isLoading: true,
  nextPage: undefined,
};

beforeAll(() => {
  initWeb3InboxClient({
    projectId: "df639b5df61c997b9e9be51c802bc5de",
    domain: "w3m-dapp.vercel.app",
    allApps: true,
  });
});

describe.skip("useManageSubscription tests", () => {
  it("should subscribe as expected", async () => {
    const { result: w3iResult } = renderHook(() => useWeb3InboxClient());

    expect(w3iResult.current.data).toBe(null);
    expect(w3iResult.current.error).toBe(null);
    expect(w3iResult.current.isLoading).toBe(true);

    await vi.waitUntil(() => w3iResult.current.data !== null, {
      timeout: 5000,
      interval: 100,
    });

    expect(w3iResult.current.data?.client).not.toBe(null);

    const { result } = renderHook(() =>
      useManageSubscription(
        "0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831",
        "w3m-dapp.vercel.app"
      )
    );
    const { result: resultW3IAccount } = renderHook(() =>
      useW3iAccount("0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831")
    );

    const { message, registerParams } =
      await resultW3IAccount.current.prepareRegistration();
    await resultW3IAccount.current.register({
      registerParams,
    });

    expect(result.current.data?.isSubscribing).equal(false);
    expect(result.current.data?.isSubscribed).equal(false);

    result.current.subscribe();

    // expect(result.current.data?.isSubscribing).equal(true);

    // await vi.waitUntil(() => result.current.data?.isSubscribing !== true, {
    //   timeout: 5000,
    //   interval: 100,
    // });

    // expect(result.current.data?.isSubscribing).toStrictEqual(false);
  });

  it.skip("should unsubscribe as expected", async () => {
    const { result } = renderHook(() =>
      useManageSubscription(
        "0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831",
        "w3m-dapp.vercel.app"
      )
    );

    // Replace this with your actual tests
    expect(result.current).toStrictEqual(initialState);
  });
});
