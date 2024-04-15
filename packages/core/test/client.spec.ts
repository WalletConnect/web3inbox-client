import { describe, it, expect, beforeEach } from "vitest";
import { Web3InboxClient } from "../src/client/index";
import { NotifyClientTypes } from "@walletconnect/notify-client";
import { proxy } from "valtio";

const projectId = process.env.TEST_PROJECT_ID as string;
const testDomain = "unrelated.example.xyz";
const testAccount = "testAccount";

export function resetSingletonState() {
  Web3InboxClient.subscriptionState = proxy({
    subscriptions: [],
    messages: [],
  });
  Web3InboxClient.instance = null;
  Web3InboxClient.clientState = proxy({
    isReady: false,
    initting: false,
    account: undefined,
    registration: undefined,
  });
}

const testSub: NotifyClientTypes.NotifySubscription = {
  account: testAccount,
  expiry: Date.now() + 100_000,
  relay: { protocol: "wss" },
  metadata: {
    appDomain: testDomain,
    description: "test description",
    icons: [],
    name: "test sub",
  },
  scope: {
    all: {
      id: Date.now().toString(),
      imageUrls: {
        lg: "",
        md: "",
        sm: "",
      },
      name: "Name",
      description: "all notifs",
      enabled: true,
    },
  },
  symKey: "validSymKey",
  topic: "validTopic",
  appAuthenticationKey: Date.now().toString(),
  unreadNotificationCount: 0,
};

const testDomain2 = testDomain.toUpperCase();
const testTopic2 = "differentTestTopic";

const testSub2 = {
  ...testSub,
  topic: testTopic2,
  metadata: {
    ...testSub.metadata,
    appDomain: testDomain2,
  },
};

const testSub3 = {
  ...testSub2,
  account: `testAccount${2}`,
};

// Since Web3InboxClient is a singleton, it needs to be constructed
// specifically to allow for a "clean slate" of the instance.
const initNonSingletonInstanceW3i = async (
  withAccount: string,
  withDomain: string
) => {
  resetSingletonState();

  const allApps = true;

  const w3iClient = await Web3InboxClient.init({
    projectId,
    allApps,
    domain: withDomain,
    logLevel: "debug",
  });

  Web3InboxClient.instance = w3iClient;

  await w3iClient.setAccount(withAccount);

  return w3iClient;
};

export const waitForEvent = async (
  checkForEvent: (...args: any[]) => boolean
) => {
  await new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (checkForEvent()) {
        clearInterval(intervalId);
        resolve({});
      }
    }, 50);
  });
};

describe("Web3Inbox Core Client", () => {
  beforeEach(() => {
    resetSingletonState();
    // @ts-ignore
    global.web3inbox = undefined;
  });

  describe("Init procedure", () => {
    it("successfully inits singleton", async () => {
      const w3iClient1 = await Web3InboxClient.init({
        projectId,
        domain: testDomain,
      });
      const w3iClient2 = await Web3InboxClient.init({
        projectId,
        domain: testDomain,
      });

      expect(w3iClient1).toBe(w3iClient2);
    });

    it("successfully inits a notify client", async () => {
      const w3iClient1 = await Web3InboxClient.init({
        projectId,
        domain: testDomain,
      });

      const subs = w3iClient1.getSubscriptions();

      expect(subs).toEqual([]);
    });

    it.skipIf(!projectId)("correctly updates ready state", async () => {
      expect(Web3InboxClient.clientState.isReady).toEqual(false);

      // Not awaiting to be able to observe initting state.
      Web3InboxClient.init({ projectId, domain: testDomain });

      expect(Web3InboxClient.clientState.initting).toEqual(true);

      await waitForEvent(() => {
        return Web3InboxClient.clientState.isReady;
      });

      expect(Web3InboxClient.clientState.isReady).toEqual(true);
    });
  });

  describe("Managing subscription state", () => {
    describe("Mapping and filtering subscription state", () => {
      // current being the domain that matches the set domain & account.
      it("Correctly fetches current subscription", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );
        Web3InboxClient.subscriptionState.subscriptions = [
          {
            ...testSub,
          },
        ];
        const sub = w3iClient.getSubscription();
        expect(sub?.topic).toEqual(testSub.topic);
      });

      it("Correctly fetches a specific subscription", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );
        Web3InboxClient.subscriptionState.subscriptions = [testSub, testSub2];

        const sub = w3iClient.getSubscription(testAccount, testDomain2);
        expect(sub?.topic).toEqual(testTopic2);
      });

      it("Fetches all subscriptions correctly on account", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );
        Web3InboxClient.subscriptionState.subscriptions = [
          testSub,
          testSub2,
          testSub3,
        ];
        const subs = w3iClient.getSubscriptions();

        expect(subs.length).toEqual(2);

        expect(subs.some((sub) => sub.account === testSub3.account)).toEqual(
          false
        );
      });

      it("Reacts immediately to account changes when fetching all", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );
        Web3InboxClient.subscriptionState.subscriptions = [
          testSub,
          testSub2,
          testSub3,
        ];
        const subs = w3iClient.getSubscriptions();

        expect(subs.length).toEqual(2);

        expect(subs.some((sub) => sub.account === testSub3.account)).toEqual(
          false
        );

        await w3iClient.setAccount(testSub3.account);

        // Set the subscriptions again because setting account fetches subs from notify client
        Web3InboxClient.subscriptionState.subscriptions = [
          testSub,
          testSub2,
          testSub3,
        ];

        const subs2 = w3iClient.getSubscriptions();

        expect(subs2.some((sub) => sub.account === testSub3.account)).toEqual(
          true
        );
      });

      it("Reacts immediately to account changes when fetching a single subscription", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );
        Web3InboxClient.subscriptionState.subscriptions = [
          testSub,
          testSub2,
          testSub3,
        ];

        const sub = w3iClient.getSubscription();

        expect(sub?.topic).toEqual(testSub.topic);

        await w3iClient.setAccount(testSub3.account);

        // Set the subscriptions again because setting account fetches subs from notify client
        Web3InboxClient.subscriptionState.subscriptions = [
          testSub,
          testSub2,
          testSub3,
        ];

        // specify domain but not account since we only want to test account setting
        const sub2 = w3iClient.getSubscription(
          undefined,
          testSub3.metadata.appDomain
        );

        expect(sub2?.topic).toEqual(testSub3.topic);
      });
    });

    describe("Watching state", () => {
      it("Watches current subscription", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );

        let sub: NotifyClientTypes.NotifySubscription;

        w3iClient.watchSubscription((watchedSub) => {
          if (watchedSub) sub = watchedSub;
        });

        Web3InboxClient.subscriptionState.subscriptions = [testSub];

        await waitForEvent(() => Boolean(sub));

        // We wait for sub to be assigned above
        // @ts-ignore
        expect(sub?.topic).toEqual(testSub.topic);
      });

      it("Watches if subscribed", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );

        let isSubscribed = false;

        w3iClient.watchIsSubscribed((isSubbed) => {
          isSubscribed = isSubbed;
        });

        Web3InboxClient.subscriptionState.subscriptions = [testSub];

        await waitForEvent(() => isSubscribed);

        expect(isSubscribed).toEqual(true);
      });

      it("Watches a single subscriptions scope map", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );

        let scopeMap: NotifyClientTypes.NotifySubscription["scope"] = {};

        w3iClient.watchNotificationTypes((watchedScopeMap) => {
          scopeMap = watchedScopeMap;
        });

        Web3InboxClient.subscriptionState.subscriptions = [testSub];

        await waitForEvent(() => Boolean(Object.keys(scopeMap).length));

        expect(JSON.stringify(scopeMap)).toEqual(JSON.stringify(scopeMap));
      });

      it("Watches all current subscriptions", async () => {
        const w3iClient = await initNonSingletonInstanceW3i(
          testAccount,
          testDomain
        );

        let subs: NotifyClientTypes.NotifySubscription[] = [];

        w3iClient.watchSubscriptions((watchedSubscriptions) => {
          if (watchedSubscriptions) subs = watchedSubscriptions;
        });

        Web3InboxClient.subscriptionState.subscriptions = [testSub];

        await waitForEvent(() => Boolean(subs.length));

        expect(subs.length).toEqual(1);
      });
    });
  });
});
