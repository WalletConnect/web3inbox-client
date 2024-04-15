import { vi, beforeAll, describe, expect, test } from "vitest";

import { initWeb3InboxClient } from "../utils";
import { Web3InboxClient } from "@web3inbox/core";
import { useNotifications } from "./useNotifications";
import { renderHook } from "@testing-library/react";
import { TEST_DAPP_1, TEST_ACCOUNT_1 } from '../test'

let currentClient: Web3InboxClient;

const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID;

if (!TEST_PROJECT_ID) {
  throw new Error("TEST_PROJECT_ID is needed for this test");
}

describe("useNotifications", () => {
  beforeAll(async () => {
    currentClient = await initWeb3InboxClient({
      projectId: TEST_PROJECT_ID,
      domain: TEST_DAPP_1,
      allApps: true,
    });
  });

  test("should fetch the new notification", async () => {
    currentClient.pageNotifications = vi.fn();

    Web3InboxClient.clientState.account = TEST_ACCOUNT_1;

    const notificationsPerPage = 5;
    const isInfiniteScroll = true;
    const unreadFirst = true;

    const { result: notificationsResult } = renderHook(() =>
      useNotifications(
        notificationsPerPage,
        isInfiniteScroll,
        TEST_ACCOUNT_1,
        TEST_DAPP_1,
        unreadFirst
      )
    );

    expect(currentClient.pageNotifications).toHaveBeenCalledOnce();

    expect(currentClient.pageNotifications).toHaveBeenCalledWith(
      notificationsPerPage,
      isInfiniteScroll,
      TEST_ACCOUNT_1,
      TEST_DAPP_1,
      unreadFirst
    );
  });
});
