# MiniLedger

Track money you've lent to friends. Node.js + TypeScript + PostgreSQL backend, React Native (Expo) app.

## Features
- Phone-number login with a **mock OTP** (printed in the server log) → JWT session
- Add a loan (friend, amount, due date, optional receipt photo), mark it repaid
- Summary: total lent, total repaid, pending, overdue amount
- Mobile: login, entries list (overdue highlighted red), add form, summary card, pull-to-refresh
- Validation (zod, client + server) and automated tests (Jest + Supertest)
- Tested with Expo Go SDK 54.

## Run it

### 1. Database
```bash
docker compose up -d        # Postgres 16 on :5432
```
(or use your own Postgres and edit `DATABASE_URL` in `backend/.env`)

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev                 # http://localhost:4000 — tables are created automatically on start
npm test                    # unit + API-guard tests (no DB needed)
```
Watch this terminal: when you request an OTP you'll see `[MOCK OTP] +91... -> 123456`.

### 3. Mobile app
```bash
cd mobile
npm install
npx expo install --fix      # aligns package versions with the installed Expo SDK
# Android emulator (default API URL is http://10.0.2.2:4000):
npm run android
# Real phone with Expo Go (same Wi-Fi) — use your computer's LAN IP:
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000 npx expo start
```
> If `npm install` complains about versions, scaffold fresh with
> `npx create-expo-app@latest mobile --template blank-typescript`, then copy `App.tsx` and `src/` over and run
> `npx expo install expo-image-picker expo-secure-store`.

## API
All `/loans` and `/summary` routes need `Authorization: Bearer <token>`.

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/request-otp` | `{phone}` | OTP logged to console; 30s resend limit |
| POST | `/auth/verify-otp` | `{phone, otp}` | returns `{token}`; OTP valid 5 min, 5 attempts, single use |
| POST | `/loans` | multipart: `friendName, amount, dueDate(YYYY-MM-DD), receipt?` | image ≤ 5 MB (jpg/png/webp) |
| GET | `/loans` | – | unpaid first, by due date; each row has `isOverdue` |
| PATCH | `/loans/:id/repaid` | – | 404 if not yours, 409 if already repaid |
| GET | `/loans/:id/receipt` | – | owner-only image download |
| GET | `/summary` | – | `{totalLent,totalRepaid,totalPending,overdueAmount,overdueCount}` |

Quick curl test:
```bash
curl -X POST localhost:4000/auth/request-otp -H 'Content-Type: application/json' -d '{"phone":"+919876543210"}'
# read OTP from server log
curl -X POST localhost:4000/auth/verify-otp -H 'Content-Type: application/json' -d '{"phone":"+919876543210","otp":"123456"}'
```

## Design decisions
- **OTP** stored as an HMAC hash with expiry, attempt cap and resend throttle — never stored in plain text.
- **Money** is `NUMERIC(12,2)`, never float, in the DB. **Dates** are `DATE` and returned as `YYYY-MM-DD` strings to avoid timezone shifts.
- **Overdue** = unpaid AND `due_date < CURRENT_DATE`, computed in SQL so list and summary always agree.
- Every query filters by `user_id` from the JWT → users can only see/modify their own data.
- Receipts are stored on local disk (`uploads/`) with random filenames and served only through an authenticated endpoint. In production: S3 + signed URLs.
- State-based navigation in the app keeps dependencies minimal; React Navigation would be the next step.

## Structure
```
backend/src  config.ts db.ts otp.ts validation.ts middleware.ts app.ts index.ts routes/{auth,loans,summary}.ts __tests__/
mobile/      App.tsx src/{api.ts, theme.ts, screens/, components/}
```
