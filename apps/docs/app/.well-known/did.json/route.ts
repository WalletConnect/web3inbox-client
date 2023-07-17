import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json(
    {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
      ],
      id: "did:web:gm.walletconnect.com",
      verificationMethod: [
        {
          id: "did:web:gm.walletconnect.com#key-0",
          type: "JsonWebKey2020",
          controller: "did:web:gm.walletconnect.com",
          publicKeyJwk: {
            kty: "OKP",
            crv: "X25519",
            x: "LkGcpjljOgCjG45iOejHwPOY7zyOhtXGcn3ovbCsBX0",
          },
        },
      ],
      keyAgreement: ["did:web:gm.walletconnect.com#key-0"],
    },
    { status: 200 }
  );
}
