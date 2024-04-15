import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWeb3InboxClient } from ".";
import { initWeb3InboxClient } from "../utils";
import { renderHook } from "@testing-library/react";

const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID

if(!TEST_PROJECT_ID) {
  throw new Error("TEST_PROJECT_ID is needed for this test")
}

beforeEach(() => {
  initWeb3InboxClient({
    projectId: TEST_PROJECT_ID,
    domain: "w3m-dapp.vercel.app",
    allApps: true,
  });
});

describe("useWeb3InboxClient tests", () => {
  it("wait for client to be ready", async () => {
    const { result } = renderHook(() => useWeb3InboxClient());

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(true);

    await vi.waitUntil(() => result.current.data !== null, {
      timeout: 5000,
      interval: 100,
    });

    expect(result.current.data).not.equal(null);
    expect(result.current.error).equal(null);
    expect(result.current.isLoading).equal(false);
  });
});
