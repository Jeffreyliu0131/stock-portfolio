# Buffett Research System

Status: implemented and synthetic-tested for AAPL/MSFT; no live OpenAI or SEC claim is made by the public snapshot.

## Product contract

The research system answers one issuer-level question from official sources without receiving portfolio quantities, cost basis, cash, account identifiers, history, or backup data. It is a value-investing research workflow, not Warren Buffett, an affiliated service, a trading system, or personalized investment advice.

## Pipeline

```text
symbol + question
  -> supported-issuer plan
  -> SEC submissions + XBRL facts
  -> OpenAI Responses web_search, limited to SEC and issuer domains
  -> Evidence Ledger
  -> deterministic metrics and free-cash-flow proxy
  -> owner-earnings assumption gate
  -> no-tool structured synthesis
  -> claim/evidence and safety validation
  -> answer, sources, unknowns, counter-evidence, trace
```

The first release supports only AAPL and MSFT. Unsupported issuers fail before any provider call.

## Prompt stack

The system does not rely on one large persona prompt.

1. `officialWebResearchInstructions` defines the official-source research job. Web content, issuer names, and the user question are untrusted data. The model may collect evidence and conflicts but cannot recommend a trade or issue a final verdict.
2. `buffettSynthesisInstructions` has no tools. It receives only the bounded Evidence Ledger, deterministic metrics, the owner-earnings assumption state, and the official-web research summary.
3. The structured synthesis must return claims, framework findings, unknowns, counter-evidence, and next questions. Every fact and inference references an evidence id in the current ledger.
4. Natural-language fields cannot contain generated numbers, percentages, currency values, URLs, direct-trade language, or Buffett impersonation. Exact values are rendered from deterministic metric objects.

Prompt version: `buffett-research-v1`. The prompt builders live in `application/ai/research/buffett-research-prompts.ts` and change through normal code review, tests, and deployment.

## Tools and source hierarchy

### SEC adapter

The server calls `data.sec.gov/submissions` and `data.sec.gov/api/xbrl/companyfacts` with an operator-configured identifying User-Agent. It extracts the latest annual revenue, net income, operating cash flow, capital expenditures, latest cash, and 10-K/10-Q source metadata when available.

SEC XBRL facts are the canonical numeric lane. Missing or incompatible facts remain absent rather than being replaced with model memory.

### Web Search adapter

The server calls the OpenAI Responses API with:

- `store: false`;
- hosted `web_search`;
- live access enabled;
- `tool_choice` forced to web search;
- `allowed_domains` limited to `sec.gov` and the selected issuer's official domain;
- complete search sources requested through `web_search_call.action.sources`.

The web-search request contains only issuer identity and the research question. Web output is discovery evidence and untrusted input to the later synthesis.

### Deterministic calculation

The server may derive net margin and `operating cash flow - total capital expenditures` when source periods match. The latter is explicitly labeled a free-cash-flow proxy. It is not called owner earnings.

Owner earnings remains `ASSUMPTION_REQUIRED` until maintenance capital expenditures and incremental working capital are reliably separated. This prevents a precise-looking value from replacing a missing judgment.

## Evidence Ledger

Every item records:

- stable evidence id;
- SEC filing, SEC XBRL, or official-web source type;
- primary/discovery authority;
- title and HTTPS URL;
- retrieval, filing, and reporting periods;
- value, unit, metric, and XBRL path when numeric;
- bounded summary when supplied through a citation.

The final model can reference only ids enumerated in the current request schema. The UI resolves those ids to clickable sources.

## Failure boundaries

- Missing OpenAI key, SEC User-Agent, provider failure, invalid schema, missing official sources, unknown evidence refs, direct-trade output, generated numbers, impersonation, and timeout all fail closed.
- No partial model output is shown.
- AI output cannot write positions, cash, quotes, account state, or history.
- The current synchronous route has a bounded server duration and a low per-caller rate limit.

## Eval chain

`npm run eval:buffett` runs a credential-free synthetic gate covering supported request scope, unknown evidence, direct-trade language, impersonation, generated numbers, and the owner-earnings assumption boundary.

The latest tracked synthetic result is [available here](../evals/buffett-research/results/latest.md).

Additional tests replay synthetic SEC and OpenAI Responses payloads to verify:

- official-domain filters;
- no portfolio facts in Web Search;
- SEC-before-synthesis evidence construction;
- no tools in final synthesis;
- structured output and evidence-id enforcement;
- privacy-safe API/client behavior;
- user-visible metrics, sources, unknowns, and trace.

This does not prove live retrieval freshness, citation entailment, model quality, recruiter value, or financial outcomes. Those require fresh-provider and independent-human gates before production promotion.

## Public/private boundary

The public repository contains placeholders, synthetic fixtures, and replay tests only. `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, Alpaca credentials, SEC contact configuration, real holdings, provider payloads, and live research answers must not be committed.

Primary references:

- OpenAI Web Search: <https://developers.openai.com/api/docs/guides/tools-web-search>
- OpenAI Structured Outputs: <https://developers.openai.com/api/docs/guides/structured-outputs>
- SEC EDGAR APIs: <https://www.sec.gov/search-filings/edgar-application-programming-interfaces>
- Berkshire 1986 shareholder letter: <https://www.berkshirehathaway.com/letters/1986.html>
