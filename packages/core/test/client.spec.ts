import { describe, it, expect } from "vitest"
import { Web3InboxClient } from "../src/client/index"

const projectId = process.env.TEST_PROJECT_ID as string;
const testDomain = "unrelated.example.xyz";

describe("Web3Inbox Core Client", () => {
  it("successfully inits singleton", async () => {
    const w3iClient1 = await Web3InboxClient.init({projectId, domain: testDomain})
    const w3iClient2 = await Web3InboxClient.init({projectId, domain: testDomain})

    expect(w3iClient1).toBe(w3iClient2);
  })
})
