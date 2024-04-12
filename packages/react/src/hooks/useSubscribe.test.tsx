import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  usePrepareRegistration,
  useSubscribe,
  useWeb3InboxAccount,
  useWeb3InboxClient,
} from "./";
import { initWeb3InboxClient } from "../utils";
import { act, renderHook } from "../test/react";
import { webcrypto } from 'crypto';

const account = "eip:1:0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831";


beforeEach(async () => {

  initWeb3InboxClient({
    projectId: "df639b5df61c997b9e9be51c802bc5de",
    domain: "w3m-dapp.vercel.app",
    allApps: true,
  });

  const { result: w3iClientResult } = renderHook(() => useWeb3InboxClient());

  await vi.waitUntil(() => w3iClientResult.current.isLoading === false, {
    timeout: 10_000,
    interval: 1_000,
  });

  const { result: w3iAccountResult } = renderHook(() =>
    useWeb3InboxAccount(account)
  );

  await vi.waitUntil(() => w3iAccountResult.current.data !== null, {
    timeout: 10_000,
    interval: 1_000,
  });

  expect(w3iAccountResult.current.data).toBe(account);


  const { result: prepareRegistrationResult } = renderHook(() =>
    usePrepareRegistration(), {
      wrapper: ({children}) => {
  Object.defineProperties(global, {
    crypto: { value: webcrypto, writable: true }
  });
  Object.defineProperties(window, {
    crypto: { value: webcrypto, writable: true }
  });
	return (
	  <div>
	{children}
	</div>
	)
      }
    }
  );

  await act(async () => {
    await prepareRegistrationResult.current.prepareRegistration();
  });
});

afterEach(async () => {
  const { result: w3iAccountResult } = renderHook(() =>
    useWeb3InboxAccount(account)
  );

  await act(async () => {
    w3iAccountResult.current.setAccount(undefined);
  });
});

describe("useSubscribe tests", () => {
  it("should subscribe as expected", async () => {
    const { result: subscribeResult } = renderHook(() => useSubscribe());

    expect(subscribeResult.current.data).toBe(false);
    expect(subscribeResult.current.error).toBe(null);
    expect(subscribeResult.current.isLoading).toBe(false);

    // await act(async () => {
    //   subscribeResult.current.subscribe();
    // });

    // await vi.waitUntil(() => subscribeResult.current.error !== null, {
    //   timeout: 10_000,
    //   interval: 1_000,
    // });

    // expect(subscribeResult.current.error).toBe(
    //   `Account ${account} is not registered.`
    // );
  });

  it.skip("should return error for registration as expected", async () => {
    const { result: subscribeResult } = renderHook(() => useSubscribe());

    expect(subscribeResult.current.data).toBe(false);
    expect(subscribeResult.current.error).toBe(null);
    expect(subscribeResult.current.isLoading).toBe(false);

    await act(async () => {
      subscribeResult.current.subscribe();
    });

    await vi.waitUntil(() => subscribeResult.current.error !== null, {
      timeout: 10_000,
      interval: 1_000,
    });

    expect(subscribeResult.current.error).toBe(
      `Account ${account} is not registered.`
    );
  });
});
