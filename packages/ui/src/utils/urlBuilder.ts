export const buildW3iUrl = (
  base: string,
  account?: string,
  uiEnabled?: { chat?: string; push?: string; settings?: string }
) => {
  const searchParams = new URLSearchParams();
  if (account) {
    searchParams.append("account", account);
  }
  if (uiEnabled) {
    for (const [key, value] of Object.entries(uiEnabled)) {
      searchParams.append(`${key}Enabled`, JSON.parse(value));
    }
  }

  return `${base}?${searchParams.toString()}`;
};
