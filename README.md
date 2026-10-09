# QueueBuddy – Bengaluru 🚦🏃‍♂️

> **Production-ready, mobile-first web app for booking verified human line-waiters ("Queue Buddies") at government offices across Bengaluru.**
> Arrive right when your turn is near — never waste 4–6 hours in an RTO, Sub-Registrar, or Passport line again.

---

## 🔐 Multi-Tenant Authentication & Access Control

QueueBuddy implements a strict, role-aware security perimeter backed by Supabase Auth and server-enforced `user_roles`:

### 1. Separate Styled Entry Portals & Role-Aware Routing
- **Public Directory (`/`):** Public browsing of Bengaluru offices, crowd metrics, and service checklists. Booking requires sign-in.
- **Customer Portal (`/login` & `/app`):**
  - Sign in with Google (OAuth 2.0).
  - Email + Password (with email verification and forgot password flow).
  - Passwordless Email Magic Link.
  - Redirects to `/app` (customer dashboard).
- **Buddy Partner Portal (`/buddy/login`, `/buddy/apply`, `/buddy`):**
  - Mobile-first Phone OTP login (6-digit SMS verification).
  - Email + Password alternative.
  - New buddy application at `/buddy/apply` (Name, WhatsApp number, language fluency, preferred Bengaluru zones, ID document upload, and live selfie).
  - **Status Guard:** Applicants are assigned status `"Pending"` and **cannot view or accept jobs** until approved by an Operations Admin.
- **Internal Admin Terminal (`/admin/login` & `/admin`):**
  - Restricted internal gateway with mandatory **TOTP 2FA Multi-Factor Authentication**.
  - **No public admin registration.** Staff are invited by a Super Admin or seeded via database migration.
  - Sub-role permissions enforced:
    - `super_admin`: Full clearance, user role management, and internal staff invitation desk.
    - `ops`: Live dispatch cockpit, assigning and reassigning buddies.
    - `support`: Customer disputes, 100% Razorpay test refunds, read-only buddy view.
    - `content`: Offices, working hours, fees, and document checklist templates.
- **Account Page (`/account`):** Profile overview, preferred counter language, push notification preferences, and a **DPDP Act-compliant "Delete My Account & Erase All Data"** mechanism.

---

## ⚙️ Supabase Auth Configuration Guide

### 1. Enabling Google OAuth Provider
1. Go to your [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. In **Authorized redirect URIs**, add your Supabase Auth callback URL:
   ```
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret**.
5. In your [Supabase Dashboard](https://supabase.com/dashboard) -> **Authentication** -> **Providers** -> **Google**:
   - Toggle **Enable Google provider** to ON.
   - Paste your `Client ID` and `Client Secret`.
   - Click **Save**.

### 2. Enabling Email, Magic Link & Phone OTP
- Under **Authentication -> Providers -> Email**:
  - Enable **Email provider**.
  - Toggle **Confirm email** as required for your environment.
- Under **Authentication -> Providers -> Phone**:
  - Enable Phone provider and select your SMS gateway (Twilio, MessageBird, or Supabase test phone numbers).
  - In demo mode, test with phone number `+91 98450 12345` and test OTP `123456`.

### 3. Enabling Supabase MFA (TOTP 2FA) for Admins
1. In the Supabase Dashboard, navigate to **Authentication -> Multi-Factor (MFA)**.
2. Enable **Time-based One-Time Passwords (TOTP)**.
3. Admin accounts require a 6-digit TOTP token generated via Google Authenticator or 1Password.

### 4. Database Role Security (`user_roles`)
Roles are stored in a dedicated server-controlled table `public.user_roles`:
- **Never trust roles sent from the client.**
- PostgreSQL security definer functions (`get_user_role`, `get_admin_subrole`) enforce Row Level Security (RLS) on all tables.
- A database trigger on `auth.users` automatically defaults new public sign-ups to the `customer` role.

---

## 🏗️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, TanStack Query |
| **Authentication** | Supabase Auth (Google OAuth, Email/Password, Magic Link, Phone OTP, TOTP MFA) |
| **Bilingual Support** | Instant toggle between **English** and **Kannada (ಕನ್ನಡ)** |
| **Maps** | MapLibre GL with OpenStreetMap raster/vector tiles (Free, zero API key needed; swappable to Mapbox/MapTiler) |
| **Backend & DB** | Supabase PostgreSQL, RLS policies, Edge Functions, `pg_cron` for evening reminders |
| **Payments** | Razorpay in TEST mode (UPI first: GPay, PhonePe, Paytm, QR) + HMAC-SHA256 verified webhook |
| **PWA** | Installable Web App (`manifest.json`, `sw.js`, offline fallback, push notifications) |
| **Hosting** | Vercel (Zero-config edge deployment) |

---

## 🌟 Core Modules

### 1. Office Directory
- MapLibre GL map centered on Bengaluru (`[77.5946, 12.9716]`).
- Categories: **RTO**, **Sub-Registrar**, **Passport Seva Kendra (PSK)**, **BBMP Ward / Civic Office**, **Utilities (BESCOM/BWSSB)**, **Taluk Office**.
- **10 Seeded Bengaluru Offices** (Indiranagar RTO, Jayanagar RTO, Koramangala Sub-Registrar, PSK Lalbagh, PSK Bellandur, BBMP Ward, BESCOM, etc.).
- **Honest status**: Bookable Now vs Coming Soon (with **Notify Me** demand capture).

### 2. Honest Crowd Status Engine
- **No fake AI claims**: Always states provenance honestly.
- Live Buddy Reports, Historical Weekday Averages, and Community Reports.
- Best time to visit hint.

### 3. Multi-Step Booking Wizard
1. Choose Office & Service.
2. Date, arrival time & wait duration slider.
3. **Buddy Language Preference** (Kannada, English, Hindi, Tamil, Telugu). Priority dispatch matches fluent buddies.
4. Transparent price breakdown (QueueBuddy fee vs Government counter fee).
5. Razorpay Test Payment (UPI / Card).

### 4. Interactive Document Checklist
- Templates per service with copy types (*Original*, *Photocopy*, *Both*) and "Where to get it" instructions.
- Circular SVG progress ring.
- Celebration confetti animation when mandatory docs are ready.
- **Privacy Rule**: Checklist only — zero customer documents stored.
- Download / Print clean view (`window.print()`).
- Evening 7:00 PM IST missing document reminder.

### 5. Buddy Cockpit (`/buddy`)
- GPS Office Check-in.
- Live Queue Updater (counter token, people ahead slider, queue notes).
- **"Head to Office Now!"** summon button when 2–3 tokens remain.
- Spot handover and instant UPI payout request.

### 6. Admin Desk (`/admin`)
- Sub-role clearances: `super_admin`, `ops`, `support`, `content`.
- Live Dispatch Monitor.
- Buddy Verification Desk (KYC review, ID document inspection, approval/rejection).
- Super Admin Staff Invite Desk.
- Dispute resolution with 100% Razorpay test refunds.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd queuebuddy
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ☁️ Vercel Deployment

1. Push your code to GitHub or GitLab.
2. Import the project in [vercel.com](https://vercel.com).
3. Set environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_MAP_PROVIDER=osm`
   - `NEXT_PUBLIC_DEMO_MODE=false` (for production)
4. Deploy!
