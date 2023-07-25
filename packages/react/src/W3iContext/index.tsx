"use client";
import { useCallback, useEffect } from "react";

const W3iContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configure = useCallback(async () => {
    await import("@web3inbox/widget-html");
  }, []);

  useEffect(() => {
    configure();
  });

  return <>{children}</>;
};

export default W3iContext;
