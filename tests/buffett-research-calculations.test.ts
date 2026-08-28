import { describe, expect, it } from "vitest";

import { calculateBuffettResearchMetrics } from "../application/ai/research/buffett-research-calculations.ts";
import { aaplEvidenceForContract } from "./buffett-research-fixtures.ts";

describe("Buffett research deterministic calculations", () => {
  it("derives a cash-flow proxy but refuses to call it owner earnings", () => {
    const result = calculateBuffettResearchMetrics(
      aaplEvidenceForContract(),
    );
    expect(result.metrics).toContainEqual(
      expect.objectContaining({
        key: "FREE_CASH_FLOW_PROXY",
        value: "120760000000",
        status: "DERIVED",
        evidenceRefs: [
          "sec.xbrl.operating_cash_flow.2025-09-27",
          "sec.xbrl.capital_expenditures.2025-09-27",
        ],
      }),
    );
    expect(result.ownerEarnings).toMatchObject({
      status: "ASSUMPTION_REQUIRED",
      freeCashFlowProxyUsd: "120760000000",
    });
  });
});
