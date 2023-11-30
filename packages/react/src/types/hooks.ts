export type HooksError = {
  message: string;
};

export interface HooksSuccess<T> {
  data: T;
  error: null;
  isLoading: boolean;
}

export interface HooksFail<T> {
  data: T | null;
  error: HooksError;
  isLoading: boolean;
}

export interface HooksLoading {
  data: null;
  error: null;
  isLoading: boolean;
}

export type HooksReturn<TData, TActions = {}> = (
  | HooksSuccess<TData>
  | HooksFail<TData>
  | HooksLoading
) &
  TActions;
