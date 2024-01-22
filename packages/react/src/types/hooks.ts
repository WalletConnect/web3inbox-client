export type HooksError<TErrorKeys extends string> = {
  [K in TErrorKeys | "client"]?: {
    message: string;
  };
};

export interface HooksSuccess<T> {
  data: T;
  error: null;
  isLoading: false;
}

export interface HooksFail<T, TErrorKeys extends string> {
  data: T | null;
  error: HooksError<TErrorKeys>;
  isLoading: boolean;
}

export interface HooksLoading {
  data: null;
  error: null;
  isLoading: boolean;
}

export type HooksReturn<
  TData,
  TActions = {},
  TErrorKeys extends string = never
> = (HooksSuccess<TData> | HooksFail<TData, TErrorKeys> | HooksLoading) &
  TActions;

export type SuccessOf<T> = T extends HooksReturn<infer TData>
  ? Extract<T, HooksSuccess<TData>>
  : never;
export type ErrorOf<T> = T extends HooksReturn<
  infer TData,
  any,
  infer TErrorKeys
>
  ? Extract<T, HooksFail<TData, TErrorKeys>>
  : never;
export type LoadingOf<T> = Extract<T, HooksLoading>;
