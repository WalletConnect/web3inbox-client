import React, { useEffect, useMemo, useRef } from "react";
import { Route, Routes, Navigate, MemoryRouter } from "react-router-dom";
import { AppNotifications } from "./components";
import { useW3iAccount, useInitWeb3InboxClient } from "./hooks";
import { useManageView } from "./hooks/viewHooks";
import WidgetConnect from "./views/Connect";
import { PreferencesView } from "./views/Preferences";
import WidgetSubscribe from "./views/Subscribe";
import W3iRouter from "./W3iRouter";

export interface W3iWidgetProps {
  /* Connect Account Trigger */
  onConnect: () => void;
  /* Signs message */
  onSign: (message: string) => Promise<string>;
  account: string | null;
  projectId: string;
  domain?: string;
}

export const useColorModeValue = (ref: React.RefObject<HTMLDivElement>) => {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const specifiedMode = systemTheme;
  const colors = useMemo(
    () => ({
      dark: {
        bg1: "hsla(0, 0%, 8%, 1)",
        bg2: "hsla(180, 4%, 16%, 1)",
        bg3: "hsla(0, 0%, 0%, 0.1)",
        bg4: "hsla(0, 0%, 100%, 0.1)",
        senderBubbleBg: "#272a2a",
        bgGradient1: "linear-gradient(180deg, #1b1d1d 0%, #141414 29.96%)",
        bgGradient2:
          "linear-gradient(92.29deg, #19324D 0%, rgba(25, 50, 77, 0.5) 100%)",
        activeLinkGradient:
          "linear-gradient(92.29deg, #19324D 0%, rgba(25, 50, 77, 0.5) 100%)",
        senderBoxShadow:
          "inset 1px 1px 4px #585f5f, inset -1px -1px 4px #141414",
        fg1: "hsla(180, 6%, 90%, 1)",
        fg2: "hsla(0, 0%, 100%, 0.66)",
        fg3: "hsla(180, 6%, 64%, 1)",
        fg4: "hsla(180, 5%, 50%, 1)",
        fg5: "hsla(0, 0%, 100%, 1)",
        border1: "hsla(0, 0%, 0%, 0.5)",
        border2: "hsla(0, 0%, 100%, 0.1)",
        accent1: "hsla(211, 90%, 50%, 1)",
        error1: "hsla(5, 85%, 60%, 1)",
        icon1: "hsla(180, 6%, 80%, 1)",
        qr1: "#e4e7e7",
        brightness: "0.66",
        shimmer1: "rgba(255, 255, 255, 0.05)",
        shimmer2: "rgba(255, 255, 255, 0.1)",
      },
      light: {
        bg1: "hsla(0, 0%, 100%, 1)",
        bg2: "hsla(0, 0%, 96%, 1)",
        bg3: "hsla(0, 0%, 100%, 0.1)",
        bg4: "hsla(0, 0%, 0%, 0.1)",
        senderBubbleBg: "#E1E9E9",
        senderBoxShadow:
          "inset 1px 1px 4px #FFFFFF, inset -1px -1px 4px #9EA9A9",
        bgGradient1:
          "linear-gradient(180deg, #f7f7f7 0%, rgba(255, 255, 255, 0) 29.96%)",
        bgGradient2:
          "linear-gradient(91.31deg, #E8F2FC 0%, rgba(232, 242, 252, 0) 100%)",
        activeLinkGradient:
          " linear-gradient(92.43deg, #CDE5FE 0%, #E8F2FC 101.3%)",
        fg1: "hsla(0, 0%, 8%, 1)",
        fg2: "hsla(180, 5%, 50%, 1)",
        fg3: "hsla(180, 6%, 64%, 1)",
        fg4: "hsla(180, 4%, 16%, 1)",
        fg5: "hsla(0, 0%, 100%, 1)",
        border1: "hsla(0, 0%, 0%, 0.5)",
        border2: "hsla(0, 0%, 0%, 0.1)",
        accent1: "hsla(211, 100%, 60%, 1)",
        error1: "hsla(5, 85%, 60%, 1)",
        icon1: "hsla(180, 4%, 16%, 1)",
        qr1: "#141414",
        brightness: "1.33",
        shimmer1: "rgba(0, 0, 0, 0.05)",
        shimmer2: "rgba(0, 0, 0, 0.1)",
      },
    }),
    []
  );

  const colorModeVariables = useMemo(
    () => ({
      "--bg-color-1": colors[specifiedMode].bg1,
      "--bg-color-2": colors[specifiedMode].bg2,
      "--bg-color-3": colors[specifiedMode].bg3,
      "--bg-color-4": colors[specifiedMode].bg4,
      "--bg-gradient-1": colors[specifiedMode].bgGradient1,
      "--bg-gradient-2": colors[specifiedMode].bgGradient2,
      "--active-link-gradient": colors[specifiedMode].activeLinkGradient,
      "--sender-bubble-bg": colors[specifiedMode].senderBubbleBg,
      "--sender-box-shadow": colors[specifiedMode].senderBoxShadow,
      "--fg-color-1": colors[specifiedMode].fg1,
      "--fg-color-2": colors[specifiedMode].fg2,
      "--fg-color-3": colors[specifiedMode].fg3,
      "--fg-color-4": colors[specifiedMode].fg4,
      "--fg-color-5": colors[specifiedMode].fg5,
      "--border-color-1": colors[specifiedMode].border1,
      "--border-color-2": colors[specifiedMode].border2,
      "--accent-color-1": colors[specifiedMode].accent1,
      "--error-color-1": colors[specifiedMode].error1,
      "--icon-color-1": colors[specifiedMode].icon1,
      "--qr-color-1": colors[specifiedMode].qr1,
      "--brightness-multiplier": colors[specifiedMode].brightness,
      "--shimmer-color-1": colors[specifiedMode].shimmer1,
      "--shimmer-color-2": colors[specifiedMode].shimmer2,
    }),
    [colors, specifiedMode]
  );

  useEffect(() => {
    if (!ref.current) return;

    Object.entries(colorModeVariables).forEach(([k, v]) => {
      ref.current?.style.setProperty(k, v);
    });
  }, [colorModeVariables, ref]);
};

export const W3iWidget: React.FC<W3iWidgetProps> = ({
  onConnect,
  onSign,
  account,
  domain,
  projectId,
}) => {
  const ready = useInitWeb3InboxClient({
    projectId,
    domain: domain ?? window.location.host,
  });

  const ref = useRef<HTMLDivElement>(null);
  useColorModeValue(ref);

  const { setAccount, register } = useW3iAccount();

  useEffect(() => {
    if (ready && account) {
      setAccount(account);
    }
  }, [setAccount, account, ready]);

  useEffect(() => {
    if (account && ready) {
      register(onSign);
    }
  }, [account, register, onSign, ready]);

  const { isOpen } = useManageView();

  useEffect(() => {
    console.warn(
      "The use of this widget is not recommended as it is in extremely early stages of development"
    );
  }, []);

  return (
    <div
      className="W3iWidget"
      style={{ background: "var(--bg-color-1)", color: "var(--fg-color-1)" }}
      ref={ref}
    >
      {isOpen ? (
        <MemoryRouter>
          <W3iRouter>
            <Routes>
              <Route
                path="/sign-in"
                element={
                  <WidgetConnect
                    onConnect={() => {
                      onConnect();
                    }}
                  />
                }
              />
              <Route path="/subscribe" element={<WidgetSubscribe />} />
              <Route path="/notifications" element={<AppNotifications />} />
              <Route path="/preferences" element={<PreferencesView />} />
              <Route index element={<Navigate to="/sign-in" />} />
            </Routes>
          </W3iRouter>
        </MemoryRouter>
      ) : null}
    </div>
  );
};
