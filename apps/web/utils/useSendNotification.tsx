import { useToast } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { INotification } from "../utils/types";
import { sendNotification } from "../utils/fetchNotify";
import { useAccount } from "wagmi";

function useSendNotification() {
  const [isSending, setIsSending] = useState<boolean>(false);
  const toast = useToast();
  const { address } = useAccount()


  const handleSendNotification = useCallback(
    async (notification: INotification) => {
      console.log({address})
      if (!address) {
        return;
      }
      setIsSending(true);
      try {
        const { success } = await sendNotification({
          accounts: [`eip155:1:${address}`],
          notification,
        });
        setIsSending(false);

        toast({
          status: success ? "success" : "error",
          position: "top",
          variant: "subtle",
          colorScheme: success ? "purple" : "red",
          title: success ? notification.title : "Message failed.",
        });
      } catch (error: any) {
        setIsSending(false);
        console.error({ sendNotificationError: error });
        toast({
          status: "error",
          title: error.message,
          description: error.cause,
        });
      }
    },
    [toast]
  );

  return {
    handleSendNotification,
    isSending,
  };
}

export default useSendNotification;
