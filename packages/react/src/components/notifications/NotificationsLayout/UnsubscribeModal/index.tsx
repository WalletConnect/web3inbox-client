import React, { useCallback, useContext, useMemo } from "react";
import SettingsContext from "../../../../contexts/SettingsContext/context";
import { useColorModeValue, useModals } from "../../../../utils/hooks";
import { unsubscribeModalService } from "../../../../utils/store";
import Button from "../../../general/Button";
import CrossIcon from "../../../general/Icon/CrossIcon";
import { Modal } from "../../../general/Modal/Modal";
import "./UnsubscribeModal.scss";
import Text from "../../../general/Text";
import {
  useAccount,
  useManageSubscription,
  useSubscription,
} from "../../../../hooks";

export const UnsubscribeModal: React.FC = () => {
  const { mode } = useContext(SettingsContext);
  const themeColors = useColorModeValue(mode);
  const { account } = useAccount();
  const { unsubscribe } = useManageSubscription({ account });

  const { subscription: app } = useSubscription({ account });

  if (!app) {
    return null;
  }

  return (
    <Modal onToggleModal={unsubscribeModalService.toggleModal}>
      <div className="UnsubscribeModal">
        <div className="UnsubscribeModal__header">
          <Text variant="large-500">Unsubscribe</Text>
          <Button
            className="UnsubscribeModal__close"
            customType="action-icon"
            onClick={unsubscribeModalService.closeModal}
          >
            <CrossIcon fillColor={themeColors["--fg-color-1"]} />
          </Button>
        </div>
        <div className="UnsubscribeModal__hero">
          <img src={app.metadata.icons[0]} alt="logo" />
        </div>
        <div className="UnsubscribeModal__content">
          <div className="UnsubscribeModal__content__title">
            <Text variant="paragraph-500">
              Unsubscribe from {app.metadata.name}
            </Text>
          </div>
          <div className="UnsubscribeModal__content__helper-text">
            <Text variant="small-400">
              You will stop receiving all notifications from {app.metadata.name}{" "}
              on the web inbox and in your wallet.
              <br />
              You can re-subscribe later
            </Text>
          </div>
        </div>
        <Button
          customType="danger"
          className="UnsubscribeModal__action"
          onClick={unsubscribe}
        >
          Disable Notifications
        </Button>
      </div>
    </Modal>
  );
};
