# The Nook Loyalty App

A QR-based digital loyalty card app for a real cafe built to replace paper punch cards with a secure, installable web app.

**Live App:** [nook.margarita-tech.dev](https://nook.margarita-tech.dev)

---

## What It Is

The Nook is a full-stack loyalty system with three distinct roles: customers, staff, and admins. Customers get a personal QR loyalty card on their phone. Staff scan QR codes and add stamps at checkout. Admins monitor activity through a protected dashboard.

It's built as a Progressive Web App — customers can install it directly to their home screen on Android or iOS with no App Store involved.

---

## Features

### Customer
- Create an account with phone number and optional birthday
- Sign in with phone + 4-digit PIN
- Personal QR loyalty card shown at checkout
- Track stamp progress toward a free coffee
- View pending and redeemed rewards with expiry dates
- Full visit history
- Birthday month bonus reward
- Change PIN or delete account from settings

### Staff
- PIN-protected staff login
- Search customers by name or phone
- Scan customer QR codes with the device camera
- Add stamps and redeem free coffee rewards
- Grant birthday rewards
- Brute force lockout after 3 failed PIN attempts

### Admin
- Separate PIN-protected admin login (accessible from staff panel)
- Dashboard with live stats: members, visits, redemptions, active rewards
- Average stamp progress across all members
- Top customers and recent activity feed
- Full customer list with search
- Add or remove stamps per customer
- Grant rewards and redeem on behalf of customers
- View individual customer history
- QR scanner with phone lookup fallback

### Rewards System
- 10 stamps = 1 free coffee
- Birthday month = 1 free coffee (once per year)
- Rewards expire after 90 days

---

## Security

Security was a core focus of this project, not an afterthought.

- **Custom JWT auth** — tokens are signed with a `JWT_SECRET` and verified in every Edge Function using `djwt`. Supabase's built-in `auth.getUser()` is not used because tokens are issued by the app, not Supabase Auth.
- **PIN hashing** — customer and staff PINs are hashed with SHA-256 salted with `JWT_SECRET` before storage. Plain PINs never touch the database. *Known limitation: SHA-256 is a fast hash and technically GPU-brute-forceable; upgrading to bcrypt/Argon2 in the Edge Function is on the roadmap.*
- **Brute force protection** — both staff and customer PIN flows lock out after 3 failed attempts for 20 minutes, tracked in a `failed_attempts` table accessible only via the service role key.
- **Role-based Edge Functions** — sensitive actions (add stamp, redeem reward, fetch all customers) are handled by Supabase Edge Functions that verify JWT role claims before executing.
- **Client-side token expiry checks** — before every authenticated Edge Function call, the JWT `exp` field is decoded and validated client-side. Expired tokens are cleared from sessionStorage and the user is redirected to login.
- **XSS prevention** — all user-supplied strings rendered into innerHTML (e.g. staff notes in history) are sanitized via a `sanitize()` helper that uses the DOM's `textContent` assignment to escape HTML.
- **RLS with no public policies** — the `failed_attempts` table has Row Level Security enabled with no policies, meaning only the service role key can read or write it.
- **No credentials in the repo** — API keys are injected at deploy time via GitHub Actions secrets and substituted into `config.js` using placeholder replacement. The public repo contains no real credentials.

### Known Security Limitations

The following are acknowledged limitations. They are documented here honestly rather than hidden.

- **Anon key exposure** — The Supabase anon key is publicly visible in the deployed `config.js`. This is inherent to GitHub Pages hosting with client-side apps. Supabase's Row Level Security is the primary defense — all sensitive reads go through JWT-authenticated Edge Functions, not direct DB queries. The anon key's access should be audited regularly in the Supabase dashboard.
- **Static QR codes** — Customer QR codes encode the customer ID and do not expire or rotate. A customer who photographs another's card could theoretically accumulate stamps for them. Mitigated in practice by the stamp cooldown and staff verification flow; a rotating QR implementation is on the roadmap.
- **Stamp rate limiting is client-side** — The 5-second cooldown between stamps is enforced in the browser. A direct API call bypasses it. Server-side rate limiting in the `nook-staff` Edge Function would be the proper fix.
- **No privacy policy** — The app collects phone numbers, optional birthdays, and visit history. A privacy policy and data retention notice should be added before scaling to additional customers.

---

## Tech Stack

**Frontend**
- Vanilla HTML, CSS, JavaScript (no framework)
- Multi-file module structure: `config.js`, `db.js`, `utils.js`, `auth.js`, `customer.js`, `staff.js`, `admin.js`, `app.js`
- Progressive Web App with `manifest.json` and service worker for offline support and home screen installation
- Retro pixel / arcade aesthetic using Press Start 2P and VT323 fonts

**Backend**
- Supabase PostgreSQL database
- Supabase Edge Functions (Deno/TypeScript) for all write operations and protected reads
- Custom JWT signing and verification via `djwt`

**Infrastructure**
- GitHub Pages hosting
- Custom domain via DNS CNAME record
- GitHub Actions for CI/CD with secret injection

---

## How It Works

1. A customer creates an account with their name and phone number
2. The app generates a unique QR loyalty card tied to their account
3. At checkout, staff search by phone or scan the QR code
4. A stamp is added — the customer's card updates in real time
5. After 10 stamps, a free coffee reward is automatically created
6. Staff tap Redeem when the customer uses their reward

---

## Changelog

### May 2026
- **Security: XSS fix** — all user-supplied content rendered via innerHTML now passes through a `sanitize()` helper. Affected: history notes in `renderHistList` and `renderAdminDash`, reward notes in `renderRewardChips`.
- **Security: Dead code removed** — unused Supabase Auth helpers (`signInWithEmail`, `getCurrentUser`, `getMyProfile`, `signOutAuthUser`) removed from `config.js`. These were remnants of an earlier auth approach and created false impressions about the auth architecture.
- **Security: JWT expiry enforcement** — `isTokenExpired()` utility added in `app.js`. All authenticated staff and admin actions now check token expiry before calling Edge Functions.
- **Bug fix: Staff PIN error element** — `staffPinPress` was writing error messages to `apin-err` (the admin PIN error element) instead of `spin-err` (the staff PIN error element). Error messages on wrong staff PIN now display correctly.
- **Bug fix: Service worker path** — registration path changed from `/Nook/sw.js` to `/sw.js` to match the custom domain's root deployment. Previously the PWA was failing to register its service worker on the custom domain.
- **Bug fix: Customer ID collision** — `genId()` previously generated IDs from a pool of only 9,000 values (`NOOK-1000` through `NOOK-9999`) with no collision detection. Replaced with `crypto.randomUUID()` producing a cryptographically random 8-character hex suffix (4 billion+ unique values).
- **Accessibility: Removed zoom lock** — `user-scalable=no` and `maximum-scale=1` removed from the viewport meta tag. These prevented users with low vision from zooming, violating WCAG 2.1 AA. The iOS Safari toolbar fix is handled separately by the DVH shim in `app.js`.
- **Bug fix: Duplicate Sign Out button** — settings screen had two identical Sign Out buttons; duplicate removed.

---

## What I Learned

This project pushed me well beyond a typical frontend demo. Key things I worked through:

- How to design a secure auth system without relying on a framework doing it for you — custom JWT signing, PIN hashing, brute force protection
- Why Supabase's built-in `auth.getUser()` won't work with custom-signed tokens, and how to use `djwt` to verify them manually in Edge Functions
- How Row Level Security works at the database level and how to use it as a security layer even without policies (service-role-only access)
- How to keep secrets out of a public GitHub Pages repo using GitHub Actions and placeholder substitution
- How PWAs work — manifest, service workers, caching strategies, and the difference between Android and iOS install behaviour
- How to structure a growing vanilla JS codebase into maintainable modules without a build tool
- How peer review surfaces issues that individual review misses — the QR impersonation vector and anon key exposure were caught only through multi-perspective analysis, not initial code review

---

## Project Structure

```
Nook/
├── index.html          # All screens (SPA)
├── css/
│   └── styles.css
├── js/
│   ├── config.js       # Supabase URL + keys (injected at deploy)
│   ├── db.js           # Edge Function wrappers
│   ├── utils.js        # Shared UI helpers + sanitize()
│   ├── auth.js         # Customer sign in / out / PIN
│   ├── customer.js     # Customer screen renderers
│   ├── staff.js        # Staff screens + camera
│   ├── admin.js        # Admin screens
│   └── app.js          # Router + init + isTokenExpired()
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── manifest.json       # PWA manifest
└── sw.js               # Service worker
```

---

## License

Built for educational and portfolio purposes. MIT License, see LICENSE file.
