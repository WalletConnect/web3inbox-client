import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWeb3InboxAccount, useWeb3InboxClient } from ".";
import { initWeb3InboxClient } from "../utils";
import { act, renderHook } from "@testing-library/react";
import { Web3InboxClient } from "@web3inbox/core";
import { resetSingletonState } from "../test";
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
  });
});

afterEach(() => {
  resetSingletonState();
});

describe("useWeb3InboxAccount tests", () => {
  it("should set account as expected", async () => {
    const { result: w3iClientResult } = renderHook(() => useWeb3InboxClient());

    await vi.waitUntil(() => w3iClientResult.current.isLoading === false, {
      timeout: 10_000,
      interval: 1_000,
    });

    const { result: w3iAccountResult } = renderHook(() =>
      useWeb3InboxAccount(TEST_ACCOUNT_1)
    );

    await vi.waitUntil(() => w3iAccountResult.current.data !== null, {
      timeout: 10_000,
      interval: 1_000,
    });

    expect(w3iAccountResult.current.data).toBe(TEST_ACCOUNT_1);
  });

  it("should set account manually as expected", async () => {
    const { result: w3iClientResult } = renderHook(() => useWeb3InboxClient());

    await vi.waitUntil(() => w3iClientResult.current.isLoading === false, {
      timeout: 10_000,
      interval: 1_000,
    });

    const { result: w3iAccountResult } = renderHook(() =>
      useWeb3InboxAccount()
    );

    expect(w3iAccountResult.current.data).toBe(undefined);
    expect(w3iAccountResult.current.isLoading).toBe(false);

    await act(async () => {
      w3iAccountResult.current.setAccount(TEST_ACCOUNT_1);
    });

    expect(w3iAccountResult.current.data).toBe(TEST_ACCOUNT_1);
  });
});
