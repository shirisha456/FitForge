# ADR 001 — JWT access/refresh tokens with rotation and reuse detection

## Status
Accepted (as observed in source; documented here from code inspection).

## Context
The auth module needs a session mechanism that works for both a Next.js BFF (server-side,
cookie-based) and, in principle, any other API client. It also needs to survive a stolen refresh
token without requiring every session to re-authenticate constantly.

## Decision
Use a short-lived JWT **access token** (15 minutes, `HS256`, signed with `SECRET_KEY`) alongside
a longer-lived **refresh token** (7 days) whose hash — never the raw value — is stored in the
`refresh_tokens` table, keyed by the token's own `jti` claim.

Every successful `/auth/refresh` call **rotates**: it revokes the presented token
(`revoked_at = now()`) and issues a brand-new access/refresh pair. If a refresh token that is
already marked revoked is presented again, that's a strong signal that a **stolen** token is
being replayed after the legitimate client already rotated past it — so every active refresh
token for that user is revoked immediately, forcing a full re-login everywhere.

## Consequences
- A leaked refresh token is only useful until its next legitimate use, after which any replay is
  detected and shuts down the whole session set — a real security property, not just an audit
  trail.
- The client must handle a `401` on any refresh attempt by treating the session as fully dead,
  not retryable.
- Access tokens are stateless (`HS256`, no DB check), which is fast but means a revoked *access*
  token can't be individually invalidated before its 15-minute expiry — the 15-minute window
  bounds the blast radius by design rather than requiring a token-revocation list.
