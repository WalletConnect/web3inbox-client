import { W3iWidget, W3iContext } from "@web3inbox/react-widget";

export default function Page() {
  return (
    <>
      <W3iContext>
        <W3iWidget
          account="0xfb1B63bd30CEC9D8d8Bbc4354b18D58Ea5735475"
          chatEnabled={false}
          settingsEnabled={false}
        />
      </W3iContext>
    </>
  );
}
