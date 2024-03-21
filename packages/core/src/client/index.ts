import { Core } from "@walletconnect/core";
import {
  DEFAULT_KEYSERVER_URL,
  NotifyClient,
  NotifyClientTypes,
} from "@walletconnect/notify-client";
import { proxy, subscribe } from "valtio";
import { proxySet } from "valtio/utils";
import { createPromiseWithTimeout } from "../utils/promiseTimeout";
import { isSmartWallet } from "../utils/address";

const DEFAULT_RPC_URL = "https://rpc.walletconnect.com/v1/";

const ECHO_URL = "https://echo.walletconnect.com"

export type GetNotificationsReturn = {
  notifications: NotifyClientTypes.NotifyNotification[];
  hasMore: boolean;
};

interface IClientState {
  isReady: boolean;
  initting: boolean;
  account?: string;
  // state is duplicated to guard against future data races
  registration?: { account: string; identity: string };
}

export class Web3InboxClient {
  public static maxTimeout: number = 10_000;
  public static instance: Web3InboxClient | null = null;
  public static subscriptionState: {
    subscriptions: NotifyClientTypes.NotifySubscription[];
  } = proxy({ subscriptions: [], messages: [] });
  public static clientState = proxy<IClientState>({
    isReady: false,
    initting: false,
    account: undefined,
    registration: undefined,
  });

  private constructor(
    private notifyClient: NotifyClient,
    private domain: string,
    private allApps: boolean,
    private rpcUrlBuilder: (chainId: string) => string,
    private projectId: string
  ) {}

  private getRequiredAccountParam(account?: string) {
    if (account) {
      return account;
    } else if (Web3InboxClient.clientState.account) {
      return Web3InboxClient.clientState.account;
    } else {
      return;
    }
  }

  protected attachEventListeners(): void {
    const updateInternalSubscriptions = () => {
      Web3InboxClient.subscriptionState.subscriptions =
        this.notifyClient.subscriptions.getAll();
    };

    this.notifyClient.on("notify_delete", updateInternalSubscriptions);
    this.notifyClient.on("notify_subscription", updateInternalSubscriptions);
    this.notifyClient.on("notify_update", updateInternalSubscriptions);
    this.notifyClient.on(
      "notify_subscriptions_changed",
      updateInternalSubscriptions
    );

    subscribe(Web3InboxClient.clientState, () => {
      updateInternalSubscriptions();
    });


    const clientReadyInterval = setInterval(() => {
      if (this.notifyClient.hasFinishedInitialLoad()) {

	Web3InboxClient.clientState.initting = false;
	Web3InboxClient.clientState.isReady = true;

        updateInternalSubscriptions();
        clearInterval(clientReadyInterval);
      }
    }, 100);
  }

  /**
   * Get singleton instance of Web3InboxClient
   */
  public static getInstance(): Web3InboxClient {
    if (Web3InboxClient.clientState.isReady && Web3InboxClient.instance) {
      return Web3InboxClient.instance;
    } else {
      throw new Error(
        "Client not ready. getInstance can only be called when client is ready. Consider using getIsReady"
      );
    }
  }

  /**
   * Get if singleton instance of Web3InboxClient is ready for use
   */
  public static getIsReady(): boolean {
    return Web3InboxClient.clientState.isReady;
  }

  /**
   * Watch if singleton instance of Web3InboxClient is ready for use
   *
   * @param cb - Callback that gets called when isReady updates
   */
  public static watchIsReady(cb: (isReady: boolean) => void) {
    cb(Web3InboxClient.clientState.isReady);

    return subscribe(Web3InboxClient.clientState, () => {
      cb(Web3InboxClient.clientState.isReady);
    });
  }

  /**
   * Sets account. If identity has been previously registered, it sets that too.
   *
   * @param {string} account
   */
  public async setAccount(account: string) {
    const isRegistered = await this.getAccountIsRegistered(account);
    // Account setting is duplicated to ensure it only gets updated once
    // identity state is confirmed
    if (isRegistered) {
      const identity = await this.notifyClient.identityKeys.getIdentity({
        account,
      });
      Web3InboxClient.clientState.registration = { account, identity };
      Web3InboxClient.clientState.account = account;
    } else {
      // Changing to an account that has no identity should reset identity key.
      Web3InboxClient.clientState.registration = undefined;
      Web3InboxClient.clientState.account = account;
    }
  }

  /**
   * Retrieve set account.
   *
   * @returns {string|undefined} Set account
   */
  public getAccount(): string | undefined {
    return Web3InboxClient.clientState.account;
  }

  /**
   * Watch account as it changes.
   *
   * @param cb - Callback that gets called when account updates
   */
  public watchAccount(cb: (acc: string | undefined) => void) {
    cb(Web3InboxClient.clientState.account);

    return subscribe(Web3InboxClient.clientState, () => {
      return cb(Web3InboxClient.clientState.account);
    });
  }

  /**
   * Get if account has a registered identity
   *
   * @param {string} account - account to check identity for
   *
   * @returns {boolean} isRegistered
   */
  public async getAccountIsRegistered(account: string): Promise<boolean> {
    try {
      return this.notifyClient.isRegistered({
        account,
        allApps: this.allApps,
        domain: this.domain,
      });
    } catch (e) {
      return false;
    }
  }

  /**
   * Watch account's identity registration status
   *
   * @param {string} account - account to watch identity for
   * @param cb - callback that gets called when registration status updates
   */
  public watchAccountIsRegistered(
    account: string,
    cb: (isRegistered: boolean) => void
  ) {
    this.getAccountIsRegistered(account).then(cb);

    return subscribe(Web3InboxClient.clientState, async () => {
      cb(await this.getAccountIsRegistered(account));
    });
  }

  /**
   * Init a singleton instance of the Web3InboxClient
   *
   * @param {Object} params - the params needed to init the client
   * @param {string} params.projectId - your WalletConnect Cloud project ID
   * @param {string} params.domain - The domain of the default dapp to target for functions.
   * @param {boolean} params.allApps - All account's subscriptions accessable if explicitly set to true. Only param.domain's otherwise
   *
   * @returns {Object} Web3InboxClient
   */
  public static async init(params: {
    projectId: string;
    domain?: string;
    allApps?: boolean;
    logLevel?: "error" | "info" | "debug";
    rpcUrlBuilder?: Web3InboxClient['rpcUrlBuilder'];
  }): Promise<Web3InboxClient> {
    if (Web3InboxClient.clientState.initting) {
      return new Promise<Web3InboxClient>((res) => {
        subscribe(Web3InboxClient.clientState, () => {
          if (!Web3InboxClient.clientState.isReady) {
            res(Web3InboxClient.instance!);
          }
        });
      });
    }

    if (Web3InboxClient.instance) return Web3InboxClient.instance;

    Web3InboxClient.clientState.initting = true;

    const core = new Core({
      customStoragePrefix: "w3i-core",
      projectId: params.projectId,
    });

    const notifyParams = {
      core,
      keyserverUrl: DEFAULT_KEYSERVER_URL,
      projectId: params.projectId,
      logger: params.logLevel ?? "error",
    };

    const notifyClient = await NotifyClient.init(notifyParams);

    Web3InboxClient.instance = new Web3InboxClient(
      notifyClient,
      params.domain ?? window.location.host,
      // isLimited is defaulted to true, therefore null/undefined values are defaulted to true.
      params.allApps ?? false,
      params.rpcUrlBuilder
	?? ((chainId: string) => `${DEFAULT_RPC_URL}?projectId=${params.projectId}&chainId=${chainId}`),
      params.projectId
    );

    Web3InboxClient.subscriptionState.subscriptions =
      notifyClient.subscriptions.getAll();

    Web3InboxClient.instance.attachEventListeners();

    Web3InboxClient.clientState.initting = !notifyClient.hasFinishedInitialLoad();
    Web3InboxClient.clientState.isReady = notifyClient.hasFinishedInitialLoad();

    return Web3InboxClient.instance;
  }

  /**
   * Retrieve the subscription object
   *
   * @param {string} [account] - Account to get subscription for, defaulted to current account
   * @param {string} [domain] - Domain to get subscription for, defaulted to one set in init.
   *
   * @returns {Object} Subscription Object
   */
  public getSubscription(
    account?: string,
    domain?: string
  ): NotifyClientTypes.NotifySubscription | null {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);
    const domainToSearch = domain ?? this.domain;

    if (!accountOrInternalAccount) {
      return null;
    }

    const subscription =
      Web3InboxClient.subscriptionState.subscriptions.find((sub) => {
        const accountMatch = sub.account === accountOrInternalAccount;
        const domainMatch = sub.metadata.appDomain === domainToSearch;

        return accountMatch && domainMatch;
      }) ?? null;

    return subscription;
  }

  /**
   * Retrieve the subscription object
   *
   * @param {string} [account] - Account to get subscriptions for, defaulted to current account
   *
   * @returns {Object[]} Subscription Objects
   */
  public getSubscriptions(
    account?: string
  ): NotifyClientTypes.NotifySubscription[] {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return [];
    }

    return Web3InboxClient.subscriptionState.subscriptions.filter((sub) => {
      const accountMatch = sub.account === accountOrInternalAccount;

      return accountMatch;
    });
  }

  /**
   * Watch the subscription for an account and domain combination
   *
   * @param cb - Callback that gets called with the subscription every time it is updated
   * @param {string} [account] - Account to watch subscription for, defaulted to current account
   * @param {string} [domain] - Domain to watch subscription for, defaulted to one set in init.
   */
  public watchSubscription(
    cb: (subscription: NotifyClientTypes.NotifySubscription | null) => void,
    account?: string,
    domain?: string
  ) {
    cb(this.getSubscription(account, domain));

    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.getSubscription(account, domain));
    });
  }

  /**
   * Watch the subscriptions for an account
   *
   * @param cb - Callback that gets called with the subscriptions every time they are updated
   * @param {string} [account] - Account to watch subscriptions for, defaulted to current account
   */
  public watchSubscriptions(
    cb: (subscriptions: NotifyClientTypes.NotifySubscription[]) => void,
    account?: string
  ) {
    cb(this.getSubscriptions(account));

    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.getSubscriptions(account));
    });
  }

  /**
   * Update a subscriptions for an account
   *
   * @param {string[]} scope  - Active scopes array
   * @param {string} [account] - Account to update subscription for, defaulted to current account
   * @param {string} [domain] - Domain of subscription to update, defaulted to one set in init.
   */
  public async update(
    scope: string[],
    account?: string,
    domain?: string
  ): Promise<boolean> {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);
    if (!accountOrInternalAccount) {
      return false;
    }
    const sub = this.getSubscription(account, domain);

    if (sub) {
      return createPromiseWithTimeout(
        this.notifyClient.update({
          topic: sub.topic,
          scope,
        }),
        Web3InboxClient.maxTimeout,
        "update"
      );
    }

    return false;
  }

  /**
   * Get notification types for a subscription
   *
   * @param {string} [account] - Account to get subscription notification types for, defaulted to current account
   * @param {string} [domain] - Domain to get subscription notification types for, defaulted to one set in init.
   *
   * @returns {Object[]} scope map  - Active scopes array
   */
  public getNotificationTypes(
    account?: string,
    domain?: string
  ): NotifyClientTypes.ScopeMap {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return {};
    }

    const sub = this.getSubscription(account, domain);

    if (sub) {
      return sub.scope;
    }
    return {};
  }

  public pageNotifications(
    notificationsPerPage: number,
    isInfiniteScroll?: boolean,
    account?: string,
    domain?: string
  ): (
    onNotificationDataUpdate: (notificationData: GetNotificationsReturn) => void
  ) => {
    stopWatchingNotifications: () => void;
    data: GetNotificationsReturn;
    nextPage: () => Promise<void>;
  } {
    const data = proxy<GetNotificationsReturn>({
      notifications: [],
      hasMore: false,
    });

    const currentNotificationIds = proxySet<string>([]);

    const notifyMessageListener = async () => {
      const fetchedNotificationData = await this.getNotificationHistory(
        notificationsPerPage,
        undefined,
        account,
        domain
      );
      const notification = fetchedNotificationData.notifications.shift();
      if (notification && !currentNotificationIds.has(notification.id)) {
        data.notifications = [notification, ...data.notifications];
        currentNotificationIds.add(notification.id);
      }
    }

    this.notifyClient.on("notify_message", notifyMessageListener);

    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    const nextPage = async () => {
      const lastMessage = data.notifications.length
        ? data.notifications[data.notifications.length - 1].id
        : undefined;

      const fetchedNotificationData = await this.getNotificationHistory(
        notificationsPerPage,
        lastMessage,
        accountOrInternalAccount,
        domain ?? this.domain
      );

      data.notifications = isInfiniteScroll
        ? [
            ...data.notifications,
            ...fetchedNotificationData.notifications.filter(
              (n) => !currentNotificationIds.has(n.id)
            ),
          ]
        : fetchedNotificationData.notifications;

      for (const notification of fetchedNotificationData.notifications) {
        currentNotificationIds.add(notification.id);
      }

      data.hasMore = fetchedNotificationData.hasMore;
    };

    // Get the initial next page
    nextPage();

    return (
      onNotificationDataUpdate: (
        notificationData: GetNotificationsReturn
      ) => void
    ) => {
      const unsub = subscribe(data, () => {
        onNotificationDataUpdate(data);
      })

      return {
        stopWatchingNotifications: () => {
	  this.notifyClient.off("notify_message", notifyMessageListener)
	  unsub();
	},
        data,
        nextPage,
      };
    };
  }

  /**
   * Mark specified notifications as read for a account & domain subscription
   * @param {string[]} notificationIds - Account to get subscription message history for, defaulted to current account
   * @param {string} [account] - Account to get subscription message history for, defaulted to current account
   * @param {string} [domain] - Domain to get subscription message history for, defaulted to one set in init.
   */
  public markNotificationsAsRead(notificationIds: string[], account?: string, domain?: string) {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return Promise.reject("No account configured");
    }

    const sub = this.getSubscription(
      accountOrInternalAccount,
      domain ?? this.domain
    );

    if(sub) {
      try {
        return createPromiseWithTimeout(
          this.notifyClient.markNotificationsAsRead({
            topic: sub.topic,
	    notificationIds
          }),
          Web3InboxClient.maxTimeout,
          "markNotificationsAsRead"
        );
      } catch (e) {
        this.notifyClient.core.logger.error("Failed to mark notifications as read", e);
        return Promise.reject();
      }
      
    } else {
      return Promise.reject(
        `No sub found for account ${account} and domain ${
          domain ?? this.domain
        }`
      );
    }
    
  }

  /**
   * Mark all notifications as read for a given account & domain subscription
   * @param {string} [account] - Account to get subscription message history for, defaulted to current account
   * @param {string} [domain] - Domain to get subscription message history for, defaulted to one set in init.
   */
  public markAllNotificationsAsRead(account?: string, domain?: string) {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return Promise.reject("No account configured");
    }

    const sub = this.getSubscription(
      accountOrInternalAccount,
      domain ?? this.domain
    );

    if(sub) {
      try {
        return createPromiseWithTimeout(
          this.notifyClient.markAllNotificationsAsRead({
            topic: sub.topic,
          }),
          Web3InboxClient.maxTimeout,
          "markAllNotificationsAsRead"
        );
      } catch (e) {
        this.notifyClient.core.logger.error("Failed to mark all notifications as read", e);
        return Promise.reject();
      }
      
    } else {
      return Promise.reject(
        `No sub found for account ${account} and domain ${
          domain ?? this.domain
        }`
      );
    }
    
  }

  /**
   * Get message history for a subscription
   *
   * @param {number} limit - How many notifications to get after `startingAfter`
   * @param {string} [startingAfter] - ID of the notification to get messages after
   * @param {string} [account] - Account to get subscription message history for, defaulted to current account
   * @param {string} [domain] - Domain to get subscription message history for, defaulted to one set in init.
   *
   * @returns {Object[]} messages  - Message Record array
   */
  public getNotificationHistory(
    limit: number,
    startingAfter?: string,
    account?: string,
    domain?: string
  ): Promise<{
    notifications: (NotifyClientTypes.NotifyNotification & { read: () => void })[];
    hasMore: boolean;
    hasMoreUnread: boolean;
  }> {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return Promise.reject("No account configured");
    }

    const sub = this.getSubscription(
      accountOrInternalAccount,
      domain ?? this.domain
    );

    if (sub) {
      try {
        return createPromiseWithTimeout(
          this.notifyClient.getNotificationHistory({
            topic: sub.topic,
            limit,
            startingAfter,
          }).then(({hasMore, hasMoreUnread, notifications}) => ({
	    hasMore,
	    hasMoreUnread,
	    notifications: notifications.map(notification => ({
	      ...notification,
	      read: () => this.markNotificationsAsRead([notification.id], account, domain)
	    }))
	  })),
          Web3InboxClient.maxTimeout,
          "getNotificationHistory"
        );
      } catch (e) {
        console.error("Failed to fetch messages", e);
        return Promise.reject({
          hasMore: false,
          hasMoreUnread: false,
          notifications: [],
        });
      }
    } else {
      return Promise.reject(
        `No sub found for account ${account} and domain ${
          domain ?? this.domain
        }`
      );
    }
  }

  /**
   * Prepare a registration for the register function
   *
   * @param {Object} params - register params
   * @param {string} params.account - Account to register.
   *
   * @returns {Object} preparedRegistration - Prepared Registration
   */
  public prepareRegistration(params: {
    account: string;
  }): ReturnType<NotifyClient["prepareRegistration"]> {
    return createPromiseWithTimeout(
      this.notifyClient.prepareRegistration({
        account: params.account,
        domain: this.domain,
        allApps: this.allApps,
      }),
      Web3InboxClient.maxTimeout,
      "prepareRegistration"
    );
  }

  /**
   * Register account on keyserver, allowing them to subscribe
   *
   * @param {Object} params - register params
   * @param {string} params.registerParams - Prepared params for registration
   * @param {string} params.signature - Signature of prepared message
   *
   * @returns {string} identityKey  - Registered identity
   */
  public async register(params: {
    registerParams: NotifyClientTypes.NotifyRegistrationParams;
    signature: string;
  }): Promise<string> {
    try {
      const account = params.registerParams.cacaoPayload.iss
        .split(":")
        .slice(-3)
        .join(":");

      const [chainPrefix, chain, address] = account.split(":");
      const projectId = this.notifyClient?.core?.projectId;

      if(!projectId) {
	throw new Error("Project ID needs to be supplied")
      }

      const isEip1271Signature = await isSmartWallet(
        address,
        `${chainPrefix}:${chain}`,
        this.rpcUrlBuilder
      );

      const registeredIdentity = await createPromiseWithTimeout(
        this.notifyClient.register({
          registerParams: params.registerParams,
          signature: params.signature,
          signatureType: isEip1271Signature ? "eip1271" : "eip191",
        }),
        Web3InboxClient.maxTimeout,
        "register"
      );

      Web3InboxClient.clientState.registration = {
        account,
        identity: registeredIdentity,
      };

      Web3InboxClient.clientState.account = account;

      return registeredIdentity;
    } catch (e: any) {
      throw new Error(`Failed to register: ${e.message}`);
    }
  }

  /**
   * Unregister account on keyserver and unsubscribe from all topics
   *
   * @param {Object} params - register params
   * @param {string} params.account - Account to unregister.
   *
   */
  public async unregister(params: { account: string }): Promise<void> {
    try {
      await createPromiseWithTimeout(
        this.notifyClient.unregister(params),
        Web3InboxClient.maxTimeout,
        "unregister"
      );

      Web3InboxClient.clientState.registration = undefined;
    } catch (e: any) {
      throw new Error(`Failed to uregister: ${e.message}`);
    }
  }

  /**
   * Check if account is subscribed to a dapp
   *
   * @param {string} [account] - Account to check subscription status of , defaulted to current account
   * @param {string} [domain] - Domain to get subscription status of, defaulted to one set in init.
   *
   * @returns {boolean} isSubscribed
   */
  public isSubscribedToDapp(account?: string, domain?: string): boolean {
    const sub = this.getSubscription(account, domain);

    return Boolean(sub);
  }

  /**
   * Subscribe to a dapp
   *
   * @param {string} [account] - Account to subscribe with, defaulted to current account
   * @param {string} [domain] - Domain to subscribe to, defaulted to one set in init.
   *
   */
  public async subscribeToDapp(
    account?: string,
    domain?: string
  ): Promise<void> {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      console.error("Failed to subscribe since no account has been set");
      return;
    }

    if (this.isSubscribedToDapp(accountOrInternalAccount, domain)) {
      return;
    }

    await createPromiseWithTimeout(
      this.notifyClient.subscribe({
        account: accountOrInternalAccount,
        appDomain: domain ?? this.domain,
      }),
      Web3InboxClient.maxTimeout,
      "subscribe"
    );
  }

  /**
   * Unsubscribe from a dapp
   *
   * @param {string} [account] - Account to unsubscribe with, defaulted to current account
   * @param {string} [domain] - Domain to unsubscribe from, defaulted to one set in init.
   *
   */
  public async unsubscribeFromDapp(account?: string, domain?: string) {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      console.error("Failed to unsubscribe since no account has been set");
      return;
    }

    const sub = this.getSubscription(accountOrInternalAccount, domain);

    if (sub) {
      await createPromiseWithTimeout(
        this.notifyClient.deleteSubscription({ topic: sub.topic }),
        Web3InboxClient.maxTimeout,
        "deleteSubscription"
      );
    }
  }

  /**
   * Register with a push server to allow for push notifications.
   *
   * @param {string} token - APNS or FCM token.
   * @param {string} [type] - Whether the token is APNS or FCM. Defaulted to fcm.
   *
   * @returns {string} clientId - Client ID that successfully registered with echo
   */
  public async registerWithPushServer(token: string, type: "fcm" | "apns" = "fcm"): Promise<string> {
    const clientId = await this.notifyClient.core.crypto.getClientId()

    const echoUrl = `${ECHO_URL}/${this.projectId}/clients`

    const echoResponse = await fetch(echoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        type,
        token
      })
    })

    if (echoResponse.status === 200) {
      return clientId;
    }

    throw new Error(`Registration with push server failed, status: ${echoResponse.status}, response: ${await echoResponse.text()}`)
  
  }

  /**
   * Watch if account is subscribed to a dapp
   *
   * @param cb - callback that gets called every time isSubbed status changes
   * @param {string} [account] - Account to watch subscriptions for, defaulted to current account
   * @param {string} [domain] - Domain to watch subscriptions for, defaulted to one set in init.
   *
   */
  public watchIsSubscribed(
    cb: (isSubbed: boolean) => void,
    account?: string,
    domain?: string
  ) {
    cb(this.isSubscribedToDapp(account, domain));

    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.isSubscribedToDapp(account, domain));
    });
  }

  /**
   * Watch scope map (notification types) for a subscription
   *
   * @param cb - callback that gets called every time the scope map changes
   * @param {string} [account] - Account to watch subscription's scope map for, defaulted to current account
   * @param {string} [domain] - Domain to watch subscription's scope map for, defaulted to one set in init.
   *
   */
  public watchNotificationTypes(
    cb: (scopeMap: NotifyClientTypes.ScopeMap) => void,
    account?: string,
    domain?: string
  ) {
    cb(this.getSubscription(account, domain)?.scope ?? {});

    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.getSubscription(account, domain)?.scope ?? {});
    });
  }

  public on<E extends NotifyClientTypes.Event>(
    e: E,
    listener: (param: NotifyClientTypes.EventArguments[E]) => void
  ) {
    this.notifyClient.on(e, listener);
  }

  public off<E extends NotifyClientTypes.Event>(
    e: E,
    listener: (param: NotifyClientTypes.EventArguments[E]) => void
  ) {
    this.notifyClient.off(e, listener);
  }
  public once<E extends NotifyClientTypes.Event>(
    e: E,
    listener: (param: NotifyClientTypes.EventArguments[E]) => void
  ) {
    this.notifyClient.once(e, listener);
  }
}
