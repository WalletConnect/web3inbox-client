import { vi, beforeAll, describe, expect, test } from "vitest";

import { initWeb3InboxClient } from "../utils";
import { Web3InboxClient } from "@web3inbox/core";
import { useNotifications } from "./useNotifications";
import { renderHook } from '@testing-library/react'

let currentClient: Web3InboxClient
const TEST_ACCOUNT_1 = "testAccount"
const TEST_DAPP_1 = "w3m-dapp.vercel.app"

describe("useNotifications", () => {
  beforeAll(async () => {
    console.log("Initting...")
    currentClient = await initWeb3InboxClient({
      projectId: "df639b5df61c997b9e9be51c802bc5de",
      domain: "w3m-dapp.vercel.app",
      allApps: true,
    });
  });

  test("should fetch the new notification", async () => {
    currentClient.pageNotifications = vi.fn()

    Web3InboxClient.clientState.account = TEST_ACCOUNT_1

    const notificationsPerPage = 5;
    const isInfiniteScroll = true;
    const unreadFirst = true;

    const { result: notificationsResult } = renderHook(() => useNotifications(notificationsPerPage, isInfiniteScroll, TEST_ACCOUNT_1, TEST_DAPP_1, unreadFirst));

    expect(currentClient.pageNotifications).toHaveBeenCalledOnce();

    expect(currentClient.pageNotifications).toHaveBeenCalledWith(notificationsPerPage, isInfiniteScroll, TEST_ACCOUNT_1, TEST_DAPP_1, unreadFirst);
  });
})
