export const buildW3iUrl = (
  base: string,
  dappInfo: {
    name: string;
    icon: string;
    description: string;
  },
  account?: string,
  uiEnabled?: { chat?: string; push?: string; settings?: string }
) => {
  const searchParams = new URLSearchParams();
  if (account) {
    searchParams.append("authProvider", "external");
    searchParams.append("account", account);
  }

  searchParams.append("dappOrigin", window.location.origin);
  searchParams.append("dappName", dappInfo.name);
  searchParams.append("dappIcon", dappInfo.icon);
  searchParams.append("dappNotificationDescription", dappInfo.description);

  if (uiEnabled) {
    for (const [key, value] of Object.entries(uiEnabled)) {
      searchParams.append(`${key}Enabled`, JSON.parse(value));
    }
  }

  return `${base}?${searchParams.toString()}`;
};
