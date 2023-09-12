import { useEffect, useState } from "react";

export const getMetadata = async () => {
  const rs = await fetch(".well-known/wc-notify-config.json");
  const json = await rs.json();
  return json;
};

export const useMetadata = () => {
  const [metadata, setMetadata] = useState({
    description: "",
    icons: [],
    name: "",
    schemaVersion: 1,
    types: [],
  });

  useEffect(() => {
    getMetadata().then(setMetadata);
  }, [setMetadata]);

  return metadata;
};
