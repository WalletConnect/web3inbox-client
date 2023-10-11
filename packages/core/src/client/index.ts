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
    private domain: string
  ) {}

  //TODO: Make more efficient - this is very slow.
  private static updateMessages() {
    Web3InboxClient.subscriptionState.messages =
      Web3InboxClient.instance?.notifyClient.messages
        .getAll()
        .filter((m) => m)
        .flatMap((m) => Object.values(m?.messages)) ?? [];
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

  public static getInstance(): Web3InboxClient {
    if (Web3InboxClient.clientState.isReady && Web3InboxClient.instance) {
      return Web3InboxClient.instance;
    } else {
      throw new Error(
        "Client not ready. getInstance can only be called when client is ready. Consider using getIsReady"
      );
    }
  }

  public static getIsReady(): boolean {
    return Web3InboxClient.clientState.isReady;
  }

  public static watchIsReady(cb: (isReady: boolean) => void) {
    return subscribe(Web3InboxClient.clientState, () => {
      cb(Web3InboxClient.clientState.isReady);
    });
  }


  /* Sets account and identity if already registered */
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

  public getAccount() {
    return Web3InboxClient.clientState.account;
  }

  public watchAccount(cb: (acc: string) => void) {
    const acc = Web3InboxClient.clientState.account;
    if (!acc) return;
    return subscribe(Web3InboxClient.clientState, () => {
      return cb(acc);
    });
  }

  public async getAccountIsRegistered(account: string) {
    try {
      const identity = await this.notifyClient.identityKeys.getIdentity({account})
      return Boolean(identity);
    }
    catch (e) {
      return false;
    }
  }

  public watchAccountIsRegistered(account: string, cb: (isRegistered: boolean) => void) {
    return subscribe(Web3InboxClient.clientState, async () => {
      return cb(await this.getAccountIsRegistered(account))
    })
  }

  // initializes the client with persisted storage and a network connection
  public static async init(params: {
    projectId: string;
    domain?: string;
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
      params.domain ?? window.location.host
    );

    Web3InboxClient.subscriptionState.subscriptions =
      notifyClient.subscriptions.getAll();

    Web3InboxClient.instance.attachEventListeners();

    this.clientState.isReady = true;

    return Web3InboxClient.instance;
  }

  private getRequiredAccountParam(account?: string) {
    if (account) return account;
    else if (Web3InboxClient.clientState.account)
      return Web3InboxClient.clientState.account;
    else {
      console.log(
        "An account needs to be passed, or previously set account using setAccount"
      );
      return;
    }
  }

  public getSubscription(account?: string, domain?: string) {
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

  public getSubscriptions(account?: string) {
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

  public watchSubscription(
    cb: (subscription: NotifyClientTypes.NotifySubscription | null) => void,
    account?: string,
    domain?: string
  ) {
    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.getSubscription(account, domain));
    });
  }

  public watchSubscriptions(
    cb: (subscriptions: NotifyClientTypes.NotifySubscription[]) => void,
    account?: string
  ) {
    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.getSubscriptions(account));
    });
  }

  // update notify subscription
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

  // query notification types available for a dapp domain
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

  // get all messages for a subscription
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

  // delete notify message
  public deleteNotifyMessage(params: { id: number }): void {
    this.notifyClient.deleteNotifyMessage(params);
    Web3InboxClient.updateMessages();
  }

  // registers a blockchain account with an identity key if not yet registered on this client
  // additionally register sync keys
  // returns the public identity key.
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
        isLimited: true,
      });

      Web3InboxClient.clientState.registration = { account: params.account, identity: registeredIdentity };
      Web3InboxClient.clientState.account = params.account;

      return registeredIdentity;
    } catch (e) {
      throw new Error("Failed to register");
    }
  }

  public isSubscribedToDapp(account?: string, domain?: string) {
    const sub = this.getSubscription(account, domain);

    return Boolean(sub);
  }

  // Using `window.location.origin` it will check if the user is subscribed
  // to current dapp
  public isSubscribedToCurrentDapp(account?: string): boolean {
    const sub = this.getSubscription(account);

    return Boolean(sub);
  }

  public async subscribeToDapp(domain: string, account?: string): Promise<void> {
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

  // Subscribe to current dapp using `window.location.origin`
  public async subscribeToCurrentDapp(account?: string): Promise<void> {
    await this.subscribeToDapp(this.domain, account);
  }

  public async unsubscribeFromDapp(domain: string, account?: string) {

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

  public async unsubscribeFromCurrentDapp(account?: string) {
    await this.unsubscribeFromDapp(this.domain, account);
  }

  public watchIsSubscribed(cb: (isSubbed: boolean) => void, account?: string, domain?: string) {
    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.isSubscribedToDapp(domain ?? this.domain, account));
    });
  }

  public watchScopeMap(
    cb: (scopeMap: NotifyClientTypes.ScopeMap) => void,
    account?: string,
    domain?: string
  ) {
    return subscribe(Web3InboxClient.subscriptionState, () => {
      cb(this.getSubscription(domain ?? this.domain, account)?.scope ?? {});
    });
  }

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
