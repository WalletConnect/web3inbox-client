import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { useWeb3InboxAccount, useWeb3InboxClient } from ".";
import { initWeb3InboxClient } from "../utils";
import { act, renderHook } from "@testing-library/react";
import { Web3InboxClient } from "@web3inbox/core";
import { resetSingletonState } from "../test";

const account = "eip:1:0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831";

let currentClient: Web3InboxClient

beforeEach(async () => {
  currentClient = await initWeb3InboxClient({
    projectId: "df639b5df61c997b9e9be51c802bc5de",
    domain: "w3m-dapp.vercel.app",
    allApps: true,
  });
});

afterEach(() => {
  resetSingletonState()
})

describe("useWeb3InboxAccount tests", () => {
  it("should set account as expected", async () => {
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
      w3iAccountResult.current.setAccount(account);
    });

    expect(w3iAccountResult.current.data).toBe(account);
  });
});
