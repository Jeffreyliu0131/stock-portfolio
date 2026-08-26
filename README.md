# Stock Portfolio Calculator

An iPhone-first portfolio PWA that unifies positions into one current view, preserves decimal financial truth, and separates deterministic portfolio math from optional AI interpretation.

The project is designed as a product and data-safety exercise rather than a trading terminal. It records and values a portfolio; it does not place orders, recommend trades, or promise real-time prices.

## What this project demonstrates

- one canonical portfolio model across multiple input sources;
- exact decimal quantity, cost, average price, cash, and P/L calculations;
- delayed-market valuation with explicit source and timestamp semantics;
- atomic backup restore with empty-target and revision checks;
- an authenticated current-state repository with compare-and-swap protection;
- strict separation between account state, market-data providers, and AI;
- AI analysis that cites supplied portfolio evidence and cannot mutate assets;
- mobile accessibility, offline behavior, and failure-state design;
- extensive unit, property, component, security, and build verification.

## Product principles

1. **Current state is explicit.** Missing prices are missing, never silently replaced with zero.
2. **Display rounding never changes truth.** Calculations use decimal values before formatting.
3. **Recovery is safer than convenience.** Restore is previewed, confirmed, and rejected unless the target is empty.
4. **AI is advisory and evidence-bound.** Deterministic metrics are calculated locally; model output cannot become portfolio truth.
5. **No hidden broker model.** The main view answers “what is my total position?” before exposing operational detail.

## Architecture

- **UI:** Next.js/React with an iPhone-first PWA surface.
- **Domain:** framework-independent decimal portfolio, cash, market, history, and backup modules.
- **Authenticated app:** account-isolated current state with revision-based conflict protection.
- **Provider service:** market data, FX, instrument resolution, and optional AI behind exact-origin CORS.
- **Storage:** D1 current state plus device-local drafts and replaceable caches.

The snapshot uses non-production example origins in `application/http/provider-proxy-contract.ts`. An independent deployment must replace both origins together and configure its own server credentials from [`.env.example`](.env.example). No production hosting manifest or live account identifier is included.

## Verification

```bash
npm ci
npm run audit:prod
npm run typecheck
npm test
npm run build:domain
npm run build:next
```

The CI workflow installs the lockfile, rejects known high-severity dependency vulnerabilities, scans tracked files and Git history for common credential formats, and runs the build gate.

## Documentation

- [Product requirements](docs/01-PRD.md)
- [Domain calculations](docs/02-DOMAIN-AND-CALCULATIONS.md)
- [UX specification](docs/03-UX-SPEC.md)
- [Technical specification](docs/04-TECHNICAL-SPEC.md)
- [Acceptance criteria](docs/05-ACCEPTANCE-CRITERIA.md)
- [Test strategy](docs/06-TEST-STRATEGY.md)
- [Architecture decisions](docs/adr/README.md)
- [Security policy](SECURITY.md)

## Privacy

This public snapshot contains no holdings, broker exports, account identifiers, portfolio backups, real-balance screenshots, emails, API keys, deployment account IDs, or production database bindings. UI evidence uses synthetic assets and amounts.

## Public-snapshot note

The clean snapshot is derived from the latest full application branch, which was ahead of the private provider-only deployment branch. Private production history and deployment wiring remain separate. The original development process used AI coding agents; the public snapshot retains the code, tests, product constraints, and decision record without carrying over private Git history.

## License

No open-source license is granted. The source is public for portfolio review and technical discussion; all rights are reserved.
