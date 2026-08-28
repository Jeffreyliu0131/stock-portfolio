import { describe, expect, it, vi } from "vitest";

import { researchIssuerWithSec } from "../application/ai/research/server/sec-edgar-research.ts";
import { buffettResearchIssuer } from "../application/ai/research/supported-issuers.ts";
import {
  RESEARCH_NOW,
  syntheticSecCompanyFacts,
  syntheticSecSubmissions,
} from "./buffett-research-fixtures.ts";

describe("SEC EDGAR research adapter", () => {
  it("fetches submissions and XBRL facts server-side with an identifying user agent", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
      expect(init?.redirect).toBe("error");
      expect(new Headers(init?.headers).get("user-agent")).toBe(
        "StockPortfolioResearch/0.1 contact@example.com",
      );
      const url = String(input);
      return new Response(
        JSON.stringify(
          url.includes("companyfacts")
            ? syntheticSecCompanyFacts()
            : syntheticSecSubmissions(),
        ),
        { status: 200 },
      );
    });
    const result = await researchIssuerWithSec(
      buffettResearchIssuer("AAPL"),
      {
        userAgent: "StockPortfolioResearch/0.1 contact@example.com",
        retrievedAt: RESEARCH_NOW,
      },
      new AbortController().signal,
      fetchMock,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "sec.filing.10k.000032019325000079",
          sourceType: "SEC_FILING",
        }),
        expect.objectContaining({
          id: "sec.xbrl.revenue.2025-09-27",
          value: "416161000000",
        }),
        expect.objectContaining({
          id: "sec.xbrl.capital_expenditures.2025-09-27",
          value: "12715000000",
        }),
      ]),
    );
  });

  it("fails closed when SEC evidence is structurally incomplete", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) =>
      new Response(
        JSON.stringify(
          String(input).includes("companyfacts")
            ? { entityName: "Apple Inc.", facts: {} }
            : syntheticSecSubmissions(),
        ),
        { status: 200 },
      ),
    );
    await expect(
      researchIssuerWithSec(
        buffettResearchIssuer("AAPL"),
        {
          userAgent: "StockPortfolioResearch/0.1 contact@example.com",
          retrievedAt: RESEARCH_NOW,
        },
        new AbortController().signal,
        fetchMock,
      ),
    ).rejects.toMatchObject({ code: "INVALID_SEC_RESPONSE" });
  });
});
