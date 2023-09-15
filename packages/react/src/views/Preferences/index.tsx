import type { NotifyClientTypes } from "@walletconnect/notify-client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "../../components/general/Button";
import Divider from "../../components/general/Divider";
import CrossIcon from "../../components/general/Icon/CrossIcon";
import Toggle from "../../components/general/Toggle";
import Text from "../../components/general/Text";
import {
  useW3iAccount,
  useSubscriptionScopes,
  useWeb3InboxClient,
} from "../../hooks";
import { useNavigate } from "react-router-dom";

export const PreferencesView: React.FC = () => {
  const { account } = useW3iAccount();
  const client = useWeb3InboxClient();
  const nav = useNavigate();
  const { scopes, updateScopes } = useSubscriptionScopes({ account });
  const [enabledScopes, setEnabledScopes] = useState(
    Object.entries(scopes)
      .filter(([_, s]) => s.enabled)
      .map(([s]) => s)
  );

  const handleUpdatePreferences = useCallback(
    async (newScopes: string[]) => {
      client?.once("notify_update", () => {
        nav("/notifications");
      });
      updateScopes(newScopes);
    },
    [updateScopes, nav, client]
  );

  console.log({ enabledScopes, scopes });

  return (
    <div className="PreferencesModal">
      <div className="PreferencesModal__header">
        <Text variant="large-500">Preferences</Text>
        <Button
          className="PreferencesModal__close"
          customType="action-icon"
          onClick={() => nav("/notifications")}
        >
          <CrossIcon fillColor={"red"} />
        </Button>
      </div>
      <Divider />
      {Object.entries(scopes)
        .sort(([a], [b]) => a.charCodeAt(0) - b.charCodeAt(0))
        .map(([title, scope]) => (
          <div key={title} className="PreferencesModal__content">
            <div className="PreferencesModal__content__setting">
              <div>
                <h4 style={{ textTransform: "capitalize" }}>
                  <Text variant="paragraph-500">{title} Notifications</Text>
                </h4>
                <div className="PreferencesModal__content__setting__helper-text">
                  <Text variant="small-400"> {scope.description}</Text>
                </div>
              </div>
              <Toggle
                checked={enabledScopes.includes(title)}
                setChecked={(enabled) => {
                  setEnabledScopes((oldScopes) => {
                    if (enabled) {
                      return [...oldScopes, title];
                    }
                    return oldScopes.filter((t) => t !== title);
                  });
                }}
                name={"aaa"}
                id={title}
              />
            </div>
          </div>
        ))}
      <Divider />
      <div className="PreferencesModal__action">
        <Button
          className="PreferencesModal__action__btn"
          onClick={() => handleUpdatePreferences(enabledScopes)}
        >
          Update
        </Button>
      </div>
    </div>
  );
};
