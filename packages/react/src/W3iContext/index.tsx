import { useCallback } from "react";

const W3iContext = () => {
  const configure = useCallback(async () => {
    await import("@web3inbox/ui");
  }, []);
};

export default W3iContext;
