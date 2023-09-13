import { Core } from "@walletconnect/core";
import {
  DEFAULT_KEYSERVER_URL,
  NotifyClient,
  NotifyClientTypes,
} from "@walletconnect/notify-client";
import { ICore } from "@walletconnect/types";
import { proxy, subscribe } from "valtio";

export class Web3InboxClient {
  private subscriptionState: {
    subscriptions: NotifyClientTypes.NotifySubscription[];
    messages: NotifyClientTypes.NotifyMessageRecord[];
  } = proxy({ subscriptions: [], messages: [] });
  private static instance: Web3InboxClient | null = null;
  private view: { isOpen: boolean; isOpenning: boolean } = proxy({
    isOpen: false,
    isOpenning: false,
  });
  private static clientState = proxy({
    isReady: false,
    account: "",
  });

  public constructor(
    private core: ICore,
    private notifyClient: NotifyClient,
    private domain: string
  ) {}

  protected attachEventListeners(): void {
    const updateInternalSubscriptions = () => {
      this.subscriptionState.subscriptions =
        this.notifyClient.subscriptions.getAll();
    };

    //TODO: Make more efficient - this is very slow.
    const updateMessages = () => {
      this.subscriptionState.messages = this.notifyClient.messages
        .getAll()
        .map((m) => Object.values(m.messages))
        .flat()
        .flat();
    };

    this.notifyClient.on("notify_message", updateMessages);
    this.notifyClient.on("notify_update", updateInternalSubscriptions);
    this.notifyClient.on("notify_delete", updateInternalSubscriptions);
    this.notifyClient.on("notify_subscription", updateInternalSubscriptions);
    this.notifyClient.on(
      "notify_subscriptions_changed",
      updateInternalSubscriptions
    );
    this.notifyClient.on(
      // @ts-ignore
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

  public setAccount(account: string) {
    console.log("acc << Setting acc");
    Web3InboxClient.clientState.account = account;
  }

  public getAccount() {
    console.log("acc << Getting acc", Web3InboxClient.clientState.account);
    return Web3InboxClient.clientState.account;
  }

  public watchAccount(cb: (acc: string) => void) {
    return subscribe(Web3InboxClient.clientState, () => {
      return cb(Web3InboxClient.clientState.account);
    });
  }

  // initializes the client with persisted storage and a network connection
  public static async init(params: {
    projectId: string;
    domain?: string;
  }): Promise<Web3InboxClient> {
    if (Web3InboxClient.instance) return Web3InboxClient.instance;

    const core = new Core(params);

    const notifyParams = {
      core,
      keyserverUrl: DEFAULT_KEYSERVER_URL,
      projectId: params.projectId,
      logger: "debug",
    };

    const notifyClient = await NotifyClient.init(notifyParams);

    Web3InboxClient.instance = new Web3InboxClient(
      core,
      notifyClient,
      params.domain ?? window.location.origin
    );

    Web3InboxClient.instance.subscriptionState.subscriptions =
      notifyClient.subscriptions.getAll();

    Web3InboxClient.instance.attachEventListeners();

    this.clientState.isReady = true;

    return Web3InboxClient.instance;
  }

  public getSubscription(account: string) {
    const subs = Object.values(
      this.notifyClient.getActiveSubscriptions({ account })
    );

    console.log({ subs, dom: this.domain });
    const sub = subs.find((sub) => sub.metadata.appDomain === this.domain);

    return sub;
  }

  protected getSubscriptionOrThrow(account: string) {
    const subs = Object.values(
      this.notifyClient.getActiveSubscriptions({ account })
    );
    const sub = subs.find((sub) => sub.metadata.appDomain === this.domain);

    if (!sub) {
      const errMsg = `No subscription for user ${account} found.`;
      this.core.logger.error(errMsg);
    }

    return sub;
  }

  // update notify subscription
  public async update(params: {
    account: string;
    scope: string[];
  }): Promise<boolean> {
    const sub = this.getSubscriptionOrThrow(params.account);

    if (sub) {
      return this.notifyClient.update({
        topic: sub.topic,
        scope: params.scope,
      });
    }

    return false;
  }

  // query notification types available for a dapp domain
  public getNotificationTypes(params: {
    account: string;
  }): NotifyClientTypes.ScopeMap {
    const sub = this.getSubscriptionOrThrow(params.account);

    if (sub) {
      return sub.scope;
    }
    return {};
  }

  // get all messages for a subscription
  public getMessageHistory(params: {
    account: string;
  }): NotifyClientTypes.NotifyMessageRecord[] {
    const sub = this.getSubscriptionOrThrow(params.account);

    if (sub) {
      const msgHistory = this.notifyClient.getMessageHistory({
        topic: sub.topic,
      });

      return Object.values(msgHistory);
    }

    return [];
  }

  // delete notify message
  public deleteNotifyMessage(params: { id: number }): void {
    this.notifyClient.deleteNotifyMessage(params);
  }

  // registers a blockchain account with an identity key if not yet registered on this client
  // additionally register sync keys
  // returns the public identity key.
  public async register(params: {
    account: string;
    onSign: (m: string) => Promise<string>;
  }): Promise<string> {
    try {
      const regRs = await this.notifyClient.register({
        account: params.account,
        onSign: params.onSign,
        domain: this.domain,
        isLimited: true,
      });

      return regRs;
    } catch (e) {
      throw new Error("Failed to register");
    }
  }

  // Using `window.location.origin` it will check if the user is subscribed
  // to current dapp
  public isSubscribedToCurrentDapp(params: { account: string }): boolean {
    const sub = this.getSubscription(params.account);

    return Boolean(sub);
  }

  // Subscribe to current dapp using `window.location.origin`
  public async subscribeToCurrentDapp(params: {
    account: string;
  }): Promise<void> {
    const existingSub = this.getSubscription(params.account);
    if (existingSub) {
      return;
    }

    await this.notifyClient.subscribe({
      account: params.account,
      appDomain: this.domain,
    });

    return;
  }

  // unsubscribe from dapp
  public async unsubscribeFromCurrentDapp(params: { account: string }) {
    const sub = this.getSubscriptionOrThrow(params.account);

    console.log("UNSUBSCR .>>>>>");

    if (sub) {
      await this.notifyClient.deleteSubscription({ topic: sub.topic });
    }
  }

  public watchIsSubscribed(account: string, cb: (isSubbed: boolean) => void) {
    return subscribe(this.subscriptionState, () => {
      console.log(
        "Watching subscription!, isSubscribed: ",
        this.isSubscribedToCurrentDapp({ account })
      );

      cb(this.isSubscribedToCurrentDapp({ account }));
    });
  }

  public watchScopeMap(
    account: string,
    cb: (scopeMap: NotifyClientTypes.ScopeMap) => void
  ) {
    return subscribe(this.subscriptionState, () => {
      cb(this.getSubscription(account)?.scope ?? {});
    });
  }

  public watchMessages(
    account: string,
    cb: (messages: NotifyClientTypes.NotifyMessageRecord[]) => void
  ) {
    return subscribe(this.subscriptionState, () => {
      cb(Object.values(this.getMessageHistory({ account })));
    });
  }

  public openView() {
    this.view.isOpen = true;
  }

  public closeView() {
    this.view.isOpen = false;
  }

  public toggle() {
    this.view.isOpen = !this.view.isOpen;
  }

  public setViewIsLoading(isLoading: boolean) {
    this.view.isOpenning = isLoading;
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
