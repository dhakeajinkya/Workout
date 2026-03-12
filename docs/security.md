# Security Analysis

IronLogs is a data-local PWA with no backend, no authentication, and no network requests beyond initial asset loading. This document describes the threat model and relevant attack surfaces.

## Threat Model

**Architecture**: Static files served from GitHub Pages. All user data stays in the browser (IndexedDB) or is loaded from a static CSV file bundled with the deployment. There is no server, no API, and no user accounts.

**Trust boundary**: The user trusts the deployed static assets and their own CSV data. The browser's same-origin policy is the primary isolation mechanism.

## CSV Injection

### Risk

CSV data is the primary input. Malicious CSV content could attempt:
- **Formula injection**: Fields starting with `=`, `+`, `-`, `@` could execute formulas if the CSV is opened in a spreadsheet application after export.
- **HTML/script injection**: Fields containing `<script>` or other HTML tags.

### Mitigations

The CSV parser (`packages/csv-parser/src/parse.ts`) applies `sanitizeField()` to all text fields:
- Strips leading formula-trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) repeatedly to prevent stacking attacks.
- Strips all HTML tags via `/<[^>]*>/g`.
- For lift names specifically, restricts characters to `[a-zA-Z0-9 _-]` only.
- Numeric fields (weight, reps, bodyweight, sleep) are parsed with `parseFloat`/`parseInt`, which inherently reject non-numeric content.

The `exportLiftsAsCSV()` function in storage.ts sanitizes output through the `csvField()` helper. `csvField()` strips leading formula-trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) and quotes any field that contains commas, double quotes, or newlines (doubling internal quotes per RFC 4180). This prevents formula injection if the exported CSV is opened in Excel or Google Sheets.

## XSS Surface

### React's Built-in Escaping

All rendering goes through React's JSX, which escapes interpolated values by default. There are **no uses of `dangerouslySetInnerHTML`** or direct DOM `innerHTML` assignment anywhere in the web app source.

### Remaining Surface

- Lift names and notes are sanitized at parse time (HTML stripped, lift names restricted to safe characters).
- No user-supplied URLs are used in `href` attributes or image sources.
- No `eval()` or dynamic script construction.

**Assessment**: XSS risk is effectively zero given React's escaping and the input sanitization layer.

## IndexedDB Security

IndexedDB is governed by the browser's **same-origin policy**. Only code running on the exact same origin (`https://<user>.github.io`) can access the database.

Relevant properties:
- **No encryption at rest**: Data is stored in plaintext on disk. Anyone with filesystem access to the device can read it. This is acceptable since the data is non-sensitive (lift numbers, bodyweight, sleep hours).
- **No access control**: Any script on the same origin can read/write all stores. Since IronLogs has no third-party scripts or iframes, this is not a practical concern.
- **Three object stores**: `lifts` (with date index), `achievements`, `settings`. No sensitive credentials are stored.

## PWA / Service Worker Caching

The Vite PWA plugin (`vite-plugin-pwa`) is configured with `registerType: 'autoUpdate'` and caches all JS, CSS, HTML, PNG, JSON, and CSV files via Workbox.

### Implications

- **Stale data**: The service worker serves cached assets. With `autoUpdate`, the new service worker activates on the next navigation after download. There is a window where users see stale content (including stale CSV data) until the update completes.
- **Cache poisoning**: If a MITM attack occurs during initial install (before HTTPS takes effect), poisoned assets could be cached persistently. GitHub Pages enforces HTTPS, making this unlikely in practice.
- **CSV caching**: The `globPatterns` include `*.csv`. Changes to the CSV file require a service worker update cycle to propagate. Users may need to reload twice to see updated data.

## Dependency Supply Chain

### serialize-javascript

The lockfile includes `serialize-javascript@6.0.2`. This is a transitive dependency (pulled in by Vite/Rollup tooling, not used at runtime in the browser).

Historical CVEs:
- **CVE-2020-7660** (affected < 3.1.0): Cross-site scripting via crafted serialization. Version 6.0.2 is not affected.
- **CVE-2019-16769** (affected < 2.1.1): Similar XSS vector. Version 6.0.2 is not affected.

Version 6.0.2 has no known vulnerabilities. It is only used at build time, not shipped to the browser.

### General Posture

- Dependencies are managed via pnpm with a lockfile, ensuring reproducible builds.
- The runtime dependency surface is small: React, React Router, idb (IndexedDB wrapper), Recharts (charting), and a few UI utilities.
- No server-side dependencies. No database drivers. No authentication libraries.

## What Is NOT a Concern

Because there is no server, the following attack classes do not apply:

- **CSRF**: No server to forge requests against.
- **SQL injection**: No SQL database.
- **Authentication bypass**: No authentication system.
- **Server-side request forgery (SSRF)**: No server making outbound requests.
- **Session hijacking**: No sessions.
- **API abuse / rate limiting**: No API.
- **Data breach of other users' data**: Single-user, local-only data model.
