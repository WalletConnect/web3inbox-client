import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type RenderHookOptions,
  type RenderHookResult,
  type RenderResult,
  render as rtl_render,
  renderHook as rtl_renderHook,
  waitFor as rtl_waitFor,
  type waitForOptions,
} from "@testing-library/react";
import { WagmiProvider, useSignMessage } from "wagmi";
export { act, cleanup } from "@testing-library/react";

import { config } from "./config";


export const WagmiWrapper = ({children, queryClient}: {children: React.ReactNode, queryClient: QueryClient }) => {
  return (
      <WagmiProvider config={config}>
	<QueryClientProvider client={queryClient} >
	  {children}
	</QueryClientProvider>
      </WagmiProvider>
  )
}

export function render<Result, Props>(
  children: React.ReactElement,
  options?: RenderHookOptions<Props> | undefined
) {
  return rtl_render(children, {
    ...options,
  });
}

export function customRenderHook<Result, Props>(
  render: (props: Props) => Result,
  options?: RenderHookOptions<Props> | undefined
): RenderHookResult<Result, Props> {
  return rtl_renderHook(render, {
    ...options,
  });
}

export function waitFor<T>(
  callback: () => Promise<T> | T,
  options?: waitForOptions | undefined
): Promise<T> {
  return rtl_waitFor(callback, { ...options, timeout: 10_000 });
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRenderHook as renderHook };

export { useSignMessage };
