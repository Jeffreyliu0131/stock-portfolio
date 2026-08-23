# Security

## Data boundary

- Portfolio records are user-controlled current state, not analytics data.
- Never commit holdings, broker exports, copied portfolio text, backup JSON, screenshots of real balances, browser storage, or account identifiers.
- Tests and documentation use synthetic instruments and amounts.

## Provider credentials

- Alpaca and DeepSeek credentials are server-only.
- Never prefix a credential with `NEXT_PUBLIC_`.
- Browser requests use an exact allowlisted app origin and a fixed provider origin with no credentials.
- Provider responses are `no-store`; request bodies and raw model output must not be logged.

## AI boundary

AI calls require an explicit user action. The request excludes names, emails, broker account identifiers, device identifiers, history databases, backups, and internal storage metadata. Deterministic calculations remain local and model output cannot overwrite portfolio state.

## Deployment

The public snapshot contains example origins and no production hosting manifest. Operators must configure their own authenticated app, provider deployment, database, origins, budgets, and secrets.

## Reporting

Do not attach real portfolio data or credentials to a public issue. Report a vulnerability through the repository owner's GitHub profile.
