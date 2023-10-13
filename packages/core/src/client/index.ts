import { Core } from "@walletconnect/core";
import { IdentityKeys } from "@walletconnect/identity-keys";
import {
  DEFAULT_KEYSERVER_URL,
  NotifyClient,
  NotifyClientTypes,
} from "@walletconnect/notify-client";
import { proxy, subscribe } from "valtio";

interface IClientState {
  isReady: boolean;
  initting: boolean;
  account?: string;
  // state is duplicated to guard against future data races
 registration?: { account: string, identity: string}
}
export class Web3InboxClient {
  private static instance: Web3InboxClient | null = null;
  public static subscriptionState: {
    subscriptions: NotifyClientTypes.NotifySubscription[];
    messages: NotifyClientTypes.NotifyMessageRecord[];
  } = proxy({ subscriptions: [], messages: [] });
  public static view: { isOpen: boolean } = proxy({
    isOpen: false,
  });
  public static initting = false;
  public static clientState = proxy<IClientState>({
    isReady: false,
    initting: false,
    account: undefined,
    registration: undefined
  });

  public constructor(
    private notifyClient: NotifyClient,
    private domain: string,
    private isLimited: boolean
  ) {}

  //TODO: Make more efficient - this is very slow.
  private static updateMessages() {
    Web3InboxClient.subscriptionState.messages =
      Web3InboxClient.instance?.notifyClient.messages
        .getAll()
        .filter((m) => m)
        .flatMap((m) => Object.values(m?.messages)) ?? [];
  }

  private getRequiredAccountParam(account?: string) {
    if (account) {
      return account;
    }
    else if (Web3InboxClient.clientState.account) {
      return Web3InboxClient.clientState.account;
    }
    else {
      console.log(
        "An account needs to be passed, or have been previously set using `setAccount`"
      );
      return;
    }
  }


  protected attachEventListeners(): void {
    const updateInternalSubscriptions = () => {
      Web3InboxClient.subscriptionState.subscriptions =
        this.notifyClient.subscriptions.getAll();
      Web3InboxClient.updateMessages();
    };

    this.notifyClient.on("notify_message", Web3InboxClient.updateMessages);
    this.notifyClient.on("notify_delete", updateInternalSubscriptions);
    this.notifyClient.on(
      "notify_subscriptions_changed",
      updateInternalSubscriptions
    );
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
    // Account setting is duplicated to ensure it only gets updated once
    // identity state is confirmed
    if(await this.getAccountIsRegistered(account)) {
      const identity = await this.notifyClient.identityKeys.getIdentity({ account });
      Web3InboxClient.clientState.registration = { account, identity };
      Web3InboxClient.clientState.account = account;
    }
    else {
      // Changing to an account that has no identity should reset identity key.
      Web3InboxClient.clientState.registration = undefined
      Web3InboxClient.clientState.account = account;
    }
  }

 /**
  * Retrieve set account.
  *
  * @params {string} Set account
  */
  public getAccount() {
    return Web3InboxClient.clientState.account;
  }

  /**
   * Watch account as it changes.
   *
   * @param cb - Callback that gets called when account updates
   */
  public watchAccount(cb: (acc: string) => void) {
    const acc = Web3InboxClient.clientState.account;
    if (!acc) return;
    return subscribe(Web3InboxClient.clientState, () => {
      return cb(acc);
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
      const identity = await this.notifyClient.identityKeys.getIdentity({account})
      return Boolean(identity);
    }
    catch (e) {
      return false;
    }
  }

  /**
   * Watch account's identity registration status
   *
   * @param {string} account - account to watch identity for
   * @param cb - callback that gets called when registration status updates
   */
  public watchAccountIsRegistered(account: string, cb: (isRegistered: boolean) => void) {
    return subscribe(Web3InboxClient.clientState, async () => {
      return cb(await this.getAccountIsRegistered(account))
    })
  }

  /**
   * Init a singleton instance of the Web3InboxClient
   * 
   * @param {Object} params - the params needed to init the client
   * @param {string} params.projectId - your WalletConnect Cloud project ID
   * @param {string} params.domain - The domain of the default dapp to target for functions.
   * @param {boolean} params.isLimited - All account's subscriptions accessable if explicitly set to false. Only param.domain's otherwise
   *
   * @returns {Object} Web3InboxClient
   */
  public static async init(params: {
    projectId: string;
    domain?: string;
    isLimited?: boolean
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

    const identityKeys = new IdentityKeys(core, DEFAULT_KEYSERVER_URL);
    const notifyParams = {
      core,
      identityKeys,
      keyserverUrl: DEFAULT_KEYSERVER_URL,
      projectId: params.projectId,
      logger: "debug",
    };

    const notifyClient = await NotifyClient.init(notifyParams);

    Web3InboxClient.instance = new Web3InboxClient(
      notifyClient,
      params.domain ?? window.location.host,
      // isLimited is defaulted to true, therefore null/undefined values are defaulted to true.
      params.isLimited ?? true
    );

    Web3InboxClient.subscriptionState.subscriptions =
      notifyClient.subscriptions.getAll();

    Web3InboxClient.instance.attachEventListeners();

    this.clientState.isReady = true;

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
  public getSubscription(account?: string, domain?: string): NotifyClientTypes.NotifySubscription | null {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return null;
    }

    const subs = Object.values(
      this.notifyClient.getActiveSubscriptions({
        account: accountOrInternalAccount,
      })
    );

    const domainToSearch = domain ?? this.domain;
    const sub = subs.find((sub) => sub.metadata.appDomain === domainToSearch);

    return sub ?? null;
  }

  /**
   * Retrieve the subscription object
   *
   * @param {string} [account] - Account to get subscriptions for, defaulted to current account
   *
   * @returns {Object[]} Subscription Objects
   */
  public getSubscriptions(account?: string): NotifyClientTypes.NotifySubscription[] {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return [];
    }

    const subs = Object.values(
      this.notifyClient.getActiveSubscriptions({
        account: accountOrInternalAccount,
      })
    );

    return subs;
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
  public async update(scope: string[], account?: string, domain?: string): Promise<boolean> {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);
    if (!accountOrInternalAccount) {
      return false;
    }
    const sub = this.getSubscription(account, domain);

    if (sub) {
      return this.notifyClient.update({
        topic: sub.topic,
        scope,
      });
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
  public getNotificationTypes(account?: string, domain?: string): NotifyClientTypes.ScopeMap {
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

  /**
   * Get message history for a subscription
   * 
   * @param {string} [account] - Account to get subscription message history for, defaulted to current account
   * @param {string} [domain] - Domain to get subscription message history for, defaulted to one set in init.
   *
   * @returns {Object[]} messages  - Message Record array
   */
  public getMessageHistory(
    account?: string,
    domain?: string
  ): NotifyClientTypes.NotifyMessageRecord[] {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      return [];
    }

    const sub = this.getSubscription(account, domain);

    if (sub) {
      try {
        const msgHistory = this.notifyClient.getMessageHistory({
          topic: sub.topic,
        });

        return Object.values(msgHistory);
      } catch (e) {
        console.error("Failed to fetch messages", e);
        return [];
      }
    }

    return [];
  }

  /**
   * Delete message from message history 
   * 
   * @param {Object} params - Params to delete a message
   * @param {number} params.id - ID of message to delete
   */
  public deleteNotifyMessage(params: { id: number }): void {
    this.notifyClient.deleteNotifyMessage(params);
    Web3InboxClient.updateMessages();
  }

  /**
   * Register account on keyserver, allowing them to subscribe
   * 
   * @param {Object} params - register params
   * @param {string} params.account - Account to register.
   * @param params.onSign - Signing callback
   * @param {string} params.[domain] - Domain to register to, defaulted to one set in init.
   *
   * @returns {string} identityKey  - Registered identity
   */
  public async register(params: {
    account: string;
    onSign: (m: string) => Promise<string>;
    domain?: string
  }): Promise<string> {
    try {
      const registeredIdentity = await this.notifyClient.register({
        account: params.account,
        onSign: params.onSign,
        domain: params.domain ?? this.domain,
        isLimited: this.isLimited,
      });

      Web3InboxClient.clientState.registration = { account: params.account, identity: registeredIdentity };
      Web3InboxClient.clientState.account = params.account;

      return registeredIdentity;
    } catch (e) {
      throw new Error("Failed to register");
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
  public async subscribeToDapp(account?: string, domain?: string): Promise<void> {
    const accountOrInternalAccount = this.getRequiredAccountParam(account);

    if (!accountOrInternalAccount) {
      console.error("Failed to subscribe since no account has been set");
      return;
    }

    if(this.isSubscribedToDapp(accountOrInternalAccount, domain)) {
      return;
    }

    await this.notifyClient.subscribe({
      account: accountOrInternalAccount,
      appDomain: domain ?? this.domain,
    });


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
      await this.notifyClient.deleteSubscription({ topic: sub.topic });
    }
  }

  /**
   * Watch if account is subscribed to a dapp
   * 
   * @param cb - callback that gets called every time isSubbed status changes
   * @param {string} [account] - Account to watch subscriptions for, defaulted to current account
   * @param {string} [domain] - Domain to watch subscriptions for, defaulted to one set in init.
   *
   */
  public watchIsSubscribed(cb: (isSubbed: boolean) => void, account?: string, domain?: string) {
    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.isSubscribedToDapp(domain ?? this.domain, account));
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
  public watchScopeMap(
    cb: (scopeMap: NotifyClientTypes.ScopeMap) => void,
    account?: string,
    domain?: string
  ) {
    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.getSubscription(domain ?? this.domain, account)?.scope ?? {});
    });
  }

  /**
   * Watch messagees for a subscription
   * 
   * @param cb - callback that gets called every time messages update
   * @param {string} [account] - Account to watch subscription's messages for, defaulted to current account
   * @param {string} [domain] - Domain to watch subscription's messages for, defaulted to one set in init.
   *
   */
  public watchMessages(
    cb: (messages: NotifyClientTypes.NotifyMessageRecord[]) => void,
    account?: string,
    domain?: string
  ) {
    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(
        Object.values(
          this.getMessageHistory(account, domain)
        )
      );
    });
  }

  public openView() {
    Web3InboxClient.view.isOpen = true;
  }

  public closeView() {
    Web3InboxClient.view.isOpen = false;
  }

  public toggle() {
    Web3InboxClient.view.isOpen = !Web3InboxClient.view.isOpen;
  }

  public getViewIsOpen() {
    return Web3InboxClient.view.isOpen;
  }

  public watchViewIsOpen(cb: (isOpen: boolean) => void) {
    return subscribe(Web3InboxClient.view, () => {
      cb(Web3InboxClient.view.isOpen);
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
