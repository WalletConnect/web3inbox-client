import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSubscribe } from "./";
import { initWeb3InboxClient } from "../utils";
import { Web3InboxClient } from "@web3inbox/core";
import { renderHook } from "@testing-library/react";
import { TEST_DAPP_1, TEST_ACCOUNT_1 } from '../test'

let currentClient: Web3InboxClient;

const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID;

if (!TEST_PROJECT_ID) {
  throw new Error("TEST_PROJECT_ID is needed for this test");
}

beforeEach(async () => {
  currentClient = await initWeb3InboxClient({
    projectId: TEST_PROJECT_ID,
    domain: TEST_DAPP_1,
    allApps: true,
    logLevel: "debug",
  });
});

describe("useSubscribe tests", () => {
  it("should subscribe as expected", async () => {
    currentClient.subscribeToDapp = vi.fn().mockResolvedValue(true);

    Web3InboxClient.clientState.account = TEST_ACCOUNT_1;

    const { result: subscribeResult } = renderHook(() => useSubscribe());

    expect(subscribeResult.current.data).toBe(false);
    expect(subscribeResult.current.error).toBe(null);
    expect(subscribeResult.current.isLoading).toBe(false);

    subscribeResult.current.subscribe();

    expect(currentClient.subscribeToDapp).toHaveBeenCalledTimes(1);

    expect(currentClient.subscribeToDapp).toHaveBeenCalledWith(
      undefined,
      undefined
    );

    subscribeResult.current.subscribe(TEST_ACCOUNT_1);

    expect(currentClient.subscribeToDapp).toHaveBeenCalledTimes(2);

    expect(currentClient.subscribeToDapp).toHaveBeenNthCalledWith(
      2,
      TEST_ACCOUNT_1,
      undefined
    );
  });
});
