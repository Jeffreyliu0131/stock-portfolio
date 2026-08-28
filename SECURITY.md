# Security

## Data boundary

- Portfolio records are user-controlled current state, not analytics data.
- Never commit holdings, broker exports, copied portfolio text, backup JSON, screenshots of real balances, browser storage, or account identifiers.
- Tests and documentation use synthetic instruments and amounts.

## Provider credentials

- Alpaca, DeepSeek, and OpenAI credentials are server-only.
- Never prefix a credential with `NEXT_PUBLIC_`.
- Local credentials belong in ignored `.env.local` files. [`.env.example`](.env.example) contains placeholders only.
- Browser requests use an exact allowlisted app origin and a fixed provider origin with no credentials.
- Provider responses are `no-store`; request bodies and raw model output must not be logged.

## AI boundary

AI calls require an explicit user action. Opening the Buffett-framework advisor is a zero-request action. Sending a question transmits the current USD snapshot—symbols, names, quantities, costs, valuations, P/L, cash, and quote metadata—through the operator's server to DeepSeek. The request excludes names, emails, broker account identifiers, device identifiers, history databases, backups, and internal storage metadata.

The advisor is a method simulation based on public value-investing principles, not Warren Buffett or an affiliated service. Model text is untrusted: responses must pass the shared schema, select explicit framework lenses, cite allowed local evidence, and avoid direct trade instructions. Deterministic calculations remain local and model output cannot overwrite portfolio state.

Chat requests and responses live only in the open dialog's React memory. They must not be written to IndexedDB, `localStorage`, D1, exports, analytics, logs, or error reports.

## Research boundary

The AAPL/MSFT research route accepts only a supported symbol and a bounded question. It excludes portfolio holdings, quantities, cost basis, prices, P/L, cash, identity, account state, history, backups, and clipboard data.

SEC retrieval uses an operator-configured identifying User-Agent and fixed `data.sec.gov` endpoints. OpenAI Web Search is restricted to `sec.gov` and the selected issuer's official domain, uses `store: false`, and requests the complete search source list. Web documents and search summaries remain untrusted data.

The final synthesis receives the Evidence Ledger and deterministic metrics without Web Search or any other tool. Every fact, inference, and framework finding must bind current evidence ids. Generated numbers, URLs, direct-trade language, Buffett impersonation, unknown evidence, malformed output, and incomplete official retrieval fail closed.

Research requests, provider payloads, raw model output, and real answers must not be logged, persisted, committed, or attached to public issues. The public repository contains synthetic/replay evidence only.

## Public-snapshot gate

Run `npm run public:check` before publication. It rejects tracked environment files, common credential formats, client-prefixed secrets, private keys, databases, logs, HAR captures, broker exports, and portfolio backup filenames. After a production build, `npm run bundle:check` separately rejects server credential names, placeholders, and common live-secret formats in browser artifacts. CI also scans Git history. Automated scans reduce risk but do not replace a human review of staged files and screenshots.

## Deployment

The public snapshot contains example origins and no production hosting manifest. Operators must configure their own authenticated app, provider deployment, database, origins, budgets, and secrets.

## Reporting

Do not attach real portfolio data or credentials to a public issue. Report a vulnerability through the repository owner's GitHub profile.
