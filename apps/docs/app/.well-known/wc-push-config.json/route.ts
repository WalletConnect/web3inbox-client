import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json(
    {
      version: 1,
      lastModified: 1681235296477,
      types: [
        {
          name: "promotional",
          description:
            "Get notified when new features or products are launched",
        },
        {
          name: "transactional",
          description:
            "Get notified when new on-chain transactions target your account",
        },
        {
          name: "private",
          description:
            "Get notified when new updates or offers are sent privately to your account",
        },
        {
          name: "alerts",
          description:
            "Get notified when urgent action is required from your account",
        },
        {
          name: "gm_hourly",
          description: "Get notified every hour with a gm notification",
        },
      ],
    },
    { status: 200 }
  );
}
