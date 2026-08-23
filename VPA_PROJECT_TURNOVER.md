# Veteran Podcast Awards (VPA) -- Project Turnover Document

**Date:** August 23, 2026
**Production URL:** https://veteranpodcastawards.com
**Repository:** veteran-podcast-awards

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Routes & Pages](#4-routes--pages)
5. [Authentication System](#5-authentication-system)
6. [Database Schema](#6-database-schema)
7. [Supabase Edge Functions](#7-supabase-edge-functions)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Theme System](#9-theme-system)
10. [Dashboard Architecture](#10-dashboard-architecture)
11. [Admin Panel](#11-admin-panel)
12. [Key Components](#12-key-components)
13. [Environment Variables](#13-environment-variables)
14. [Deployment](#14-deployment)
15. [Key Dates](#15-key-dates)
16. [Recent Changes (August 2026 Session)](#16-recent-changes-august-2026-session)
17. [Known Issues & Remaining Work](#17-known-issues--remaining-work)
18. [Development Workflow](#18-development-workflow)

---

## 1. Project Overview

The Veteran Podcast Awards (VPA) is a web platform that celebrates and recognizes podcasters in the veteran and military community. The platform supports:

- **Public-facing marketing site** -- Home, About, Categories, Sponsors, Podcast Directory, National Military Podcast Day, Livestream
- **Podcaster onboarding** -- 4-step registration flow connecting podcasts via Podchaser or RSS
- **Award nomination & voting** -- Multi-program award system with categories, nominations, and public voting
- **User dashboard** -- Profile management, social media posting, promotion tools, inbox, voting history
- **Admin panel** -- Full CRM, email campaigns, award management, ticketing, business metrics, investor tools
- **Ticketing** -- Stripe-powered ticket purchasing with QR code passes for award ceremonies
- **Investor tools** -- Access-code-gated prospectus, pitch deck, engagement tracking

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 SPA with react-router-dom v6 |
| Build | Vite 5 with SWC (plugin-react-swc) |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 3.4 with shadcn/ui components |
| State | React Query (TanStack) for server state, React useState for local |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Edge Functions | Deno runtime |
| Hosting | Vercel (SPA mode with catch-all rewrite to index.html) |
| Payments | Stripe (Checkout Sessions + webhooks) |
| Email | Resend (transactional and campaign emails) |
| Fonts | Google Fonts -- Cinzel (headings), Inter (body) |
| Charts | Recharts (admin dashboards) |
| SEO | react-helmet-async with structured data |

**Package manager:** npm (bun lockfile also present but npm is primary)

---

## 3. Project Structure

```
veteran-podcast-awards/
├── .claude/                    # Claude Code config (launch.json for dev server)
├── dist/                       # Vite build output
├── public/                     # Static assets
├── src/
│   ├── App.tsx                 # Top-level router
│   ├── main.tsx                # React entry point
│   ├── index.css               # Tailwind base + CSS variable theme definitions
│   ├── assets/                 # hero-bg.jpg, vpa-logo.png, national-military-podcast-day.png
│   ├── components/
│   │   ├── admin/              # 17 admin panel components
│   │   ├── contact/            # ContactFormDialog
│   │   ├── dashboard/          # DashboardHome, ShareSection, ConnectorsSection, GetNominatedSection, etc.
│   │   ├── home/               # Hero, HowItWorks, CallToAction, CategoriesPreview, CountdownTimer
│   │   ├── investor/           # InvestorMetricsPanel
│   │   ├── layout/             # Header, Footer
│   │   ├── podcasts/           # PodcastGrid, PodcastChatbot, PodchaserDiscoverSection, etc.
│   │   ├── sponsors/           # SponsorDisplay
│   │   ├── theme/              # ThemeToggle, ThemeSelector
│   │   └── ui/                 # 49 shadcn/ui primitives
│   ├── hooks/
│   │   ├── useAuth.ts          # Auth hook (user, session, roles, sign in/up/out)
│   │   ├── useTheme.tsx        # Theme provider (light/dark/system)
│   │   └── use-toast.ts        # Toast notifications
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client configuration
│   │       └── types.ts        # Auto-generated TypeScript types for all tables
│   ├── lib/
│   │   ├── awards.ts           # Award-related utilities
│   │   └── utils.ts            # General utilities (cn helper, etc.)
│   └── pages/                  # All page-level route components
├── supabase/
│   ├── config.toml             # Project config, JWT settings per function
│   ├── functions/              # 13 Deno edge functions
│   ├── migrations/             # 30+ SQL migration files
│   └── manual/                 # Manual SQL scripts
├── package.json
├── tailwind.config.ts          # Custom colors, fonts, dark mode config
├── vite.config.ts              # Dev server on port 8080, @ path alias
├── vercel.json                 # SPA rewrite rule
└── components.json             # shadcn/ui configuration
```

---

## 4. Routes & Pages

| Path | Component | Auth Required | Description |
|------|-----------|:---:|-------------|
| `/` | `Index` | No | Landing page (Hero, HowItWorks, CallToAction) |
| `/livestream` | `Livestream` | No | Livestream page |
| `/categories` | `Categories` | No | Award categories listing |
| `/categories/:categorySlug` | `CategoryDetailPage` | No | Single category with nominees |
| `/awards` | `AwardsProgramsPage` | No | List of award programs |
| `/awards/:programId/categories` | `AwardsProgramCategoriesPage` | No | Categories within a program |
| `/awards/:programId/categories/:categoryId` | `AwardsCategoryNomineesPage` | No | Nominees in a category |
| `/awards/:programId/tickets` | `AwardTicketsPage` | No | Ticket purchasing |
| `/ticket/:token` | `TicketPassPage` | No | QR ticket pass (accessed via email link) |
| `/vote/:nominationId` | `VotePage` | No | Public voting page |
| `/network` | `Network` | No | Podcast directory with Podchaser integration |
| `/sponsors` | `Sponsors` | No | Sponsors listing |
| `/podcast-day` | `PodcastDay` | No | National Military Podcast Day |
| `/about` | `About` | No | About page |
| `/privacy` | `Privacy` | No | Privacy policy |
| `/terms` | `Terms` | No | Terms of service |
| `/auth` | `Auth` | No | Login/signup (supports `?mode=signup`, `?intent=voter`, `?returnTo=`) |
| `/dashboard` | `Dashboard` | Yes | User dashboard (9 sections) |
| `/onboarding` | `Onboarding` | Yes | 4-step podcaster onboarding |
| `/podcaster/:username` | `PodcasterProfile` | No | Public podcaster profile |
| `/opportunity` | `Opportunity` | No | Sponsorship opportunity page |
| `/admin` | `Admin` | Yes (admin) | Admin panel (role-gated) |
| `/prospectus` | `InvestorPage` | Access code | Investor prospectus |
| `/invest/:token` | `InvestorSharePage` | Token | Shared investor link |
| `/vpa-deck` | `VPADeck` | No | VPA pitch deck |
| `/export-data` | `ExportData` | Yes | Data export page |
| `/reset-password` | `ResetPassword` | No | Password reset |
| `*` | `NotFound` | No | 404 catch-all |

---

## 5. Authentication System

**Provider:** Supabase Auth with email/password and Google OAuth.

**Auth hook** ([useAuth.ts](src/hooks/useAuth.ts)):
- Exposes: `user`, `session`, `loading`, `isAdmin`, `roles`, `hasRole`, `signIn`, `signUp`, `signOut`, `requestPasswordReset`, `updatePassword`
- On auth state change, fetches user roles from `user_roles` table
- Role types: `admin`, `moderator`, `user`

**Sign-up flow:**
1. User selects type (podcaster or fan), enters name, email, password
2. `supabase.auth.signUp()` stores `full_name` and `user_type` in metadata
3. On success, upserts a `podcast_contacts` record (source: "Website Signup")
4. Shows "Check your email" verification screen with resend option

**Email confirmation flow:**
1. User clicks verification link in email
2. `auth-webhook` edge function fires on `auth.users` UPDATE
3. Webhook schedules a 5-minute delayed call to `send-welcome-email`
4. Welcome email sent via Resend from "Riccoh Player, CEO & Founder"
5. Different templates for podcaster vs fan

**Google OAuth:**
- `supabase.auth.signInWithOAuth({ provider: "google" })` with redirect to `/dashboard`

**Password reset:**
- `requestPasswordReset` sends email via Supabase with redirect to `/reset-password`
- `/reset-password` page calls `supabase.auth.updateUser({ password })`

**Route protection:**
- No global route guard -- individual pages check `useAuth()` and redirect to `/auth`
- Admin page checks `isAdmin` flag
- Investor page uses access codes verified against `investor_access` table

**Onboarding redirect:**
- After first login, podcasters without `onboarding_completed = true` are redirected to `/onboarding`

---

## 6. Database Schema

All tables are in Supabase PostgreSQL. Types are auto-generated at [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts).

### Core Tables

**`profiles`** -- User profiles (1:1 with auth.users)
- `id` (UUID, FK to auth.users), `full_name`, `email`, `avatar_url`, `bio`, `user_type` (podcaster/fan/admin)
- `website_url`, `username_slug`, `is_public`, `allow_contact`
- `podcast_id` (FK to podcasts), `onboarding_completed`
- Podcast fields: `podcast_name`, `podcast_rss`, `podcast_image_url`, `podchaser_id`, `hosting_platform`, `distribution_platforms[]`
- Military fields: `military_branch`, `military_affiliation`
- Award fields: `selected_categories[]`, `custom_voting_link`
- Business fields: `has_ad_agency`, `interested_in_opportunities`
- Social: `social_twitter`, `social_instagram`, `social_linkedin`

**`podcasts`** -- Podcast directory entries
- `id`, `title`, `author`, `description`, `rss_url`, `image_url`, `website_url`
- `is_active`, `display_order`, `episodes` (JSON), `last_fetched_at`

**`podcast_contacts`** -- CRM contacts
- `email` (unique), `name`, `host_name`, `podcast_name`, `podcast_url`, `rss_url`
- `source`, `status`, `tags[]`, `lists[]`, `notes`, `contact_type`
- `is_on_vpn`, `linked_podcast_id` (FK to podcasts)

### Awards Tables

**`award_programs`** -- Award programs (e.g., "2026 VPA")
- `id`, `name`, `year`, `status` (draft/active/closed), `tagline`, `organization_name`
- `primary_color`, `logo_url`, `website_url`
- `nominations_open_at`, `voting_open_at`, `ceremony_at`, `external_ticket_url`

**`award_categories`** -- Categories within programs
- `id`, `program_id` (FK), `name`, `slug`, `description`, `sort_order`

**`nominations`** -- Podcast nominations
- `id`, `user_id`, `podcast_id` (FK), `podcast_name`, `podcaster_name`, `category_id` (FK)

**`votes`** -- User votes
- `user_id`, `category_id`, `program_id`, `nominee_id/podcast_id`, `vote_slot`, `year`

**`vote_counts`** -- Aggregated vote counts
- `podcast_id`, `category_id`, `program_id`, `vote_count`

**`featured_nominees`** -- Featured nominees for display
- `podcast_name`, `host_name`, `category`, `description`, `image_url`, `podcast_url`, `display_order`, `is_active`

### Ticketing Tables

**`award_ticket_types`** -- Ticket configurations
- `id`, `program_id` (FK), `name`, `description`, `price_cents`, `quantity_total`, `quantity_sold`
- `ticket_kind`, `sort_order`, `is_active`

**`award_ticket_purchases`** -- Ticket orders
- `id`, `program_id`, `buyer_name`, `buyer_email`, `line_items` (JSON), `total_amount_cents`
- `status` (pending/completed), `qr_token`, `stripe_checkout_session_id`, `stripe_payment_intent_id`
- `checked_in_at`

### Email/Marketing Tables

**`email_campaigns`** -- Email campaign records
- `name`, `subject`, `content`, `target_list`, `status`, `sent_count`, `opened_count`, `clicked_count`

**`email_sends`** -- Per-recipient send tracking
- `campaign_id` (FK), `contact_id` (FK), `email`, `status`, `resend_id`, `opened_at`, `clicked_at`

**`mailing_lists`** / **`smart_lists`** -- List management

### Messaging

**`podcaster_messages`** -- Direct messages to podcasters
- `recipient_id` (FK to profiles), `sender_name`, `sender_email`, `subject`, `message`, `is_read`

### Other Tables

- **`favorites`** -- User podcast favorites (`user_id`, `podcast_id`)
- **`sponsors`** -- Sponsor entries with tier (enum), logo, display order
- **`user_roles`** -- Role assignments (`admin`, `moderator`, `user`)
- **`promotional_assets`** -- Podcast promotional assets
- **`podchaser_cache`** -- API response cache with 48-hour TTL
- **`pre_registrations`** -- Pre-launch email collection
- **`podcast_submissions`** -- Public podcast submissions
- **`podcast_reports`** -- Podcast report data

### Investor Tables

- **`investor_access`** -- Access codes with allowed tabs and expiration
- **`investor_engagement_events`** -- Investor activity tracking
- **`investor_share_links`** / **`investor_share_link_visits`** -- Shareable investor links
- **`investor_videos`** -- Pitch videos
- **`deck_engagement_events`** -- Pitch deck engagement tracking

### Storage

- **`sponsor-logos`** -- Supabase Storage bucket for sponsor logo uploads

### RPC Functions

- `increment_campaign_opened(campaign_id)` -- Atomic counter for email opens
- `increment_campaign_clicked(campaign_id)` -- Atomic counter for email clicks

---

## 7. Supabase Edge Functions

All 13 functions are in `supabase/functions/`. JWT verification status noted per function.

| Function | JWT | Purpose |
|----------|:---:|---------|
| `auth-webhook` | No | Fires on email confirmation, schedules welcome email |
| `create-ticket-checkout` | No | Creates Stripe Checkout Session for ticket purchases |
| `stripe-tickets-webhook` | No | Handles Stripe payment completion, sends confirmation with QR |
| `parse-rss` | No | Fetches and parses RSS/Atom feeds, extracts podcast metadata |
| `podcast-assistant` | No | AI chatbot using Gemini 2.5 Flash for podcast discovery |
| `podchaser-proxy` | No | Proxies Podchaser REST API v1, caches results 48 hours |
| `send-campaign` | Yes | Bulk email campaigns via Resend with merge tags and tracking |
| `send-demo-email` | Yes | Admin-only single test email |
| `send-podcaster-contact` | No | Sends contact notification to podcaster |
| `send-welcome-email` | No | Branded welcome emails (podcaster/fan/sponsorship/nomination) |
| `social-connect` | Yes | Upload Post API integration for social account OAuth |
| `social-post` | Yes | Posts to connected social platforms via Upload Post |
| `track-email` | No | Open pixel (1x1 PNG) and click redirect tracking |

### Function Details

**podchaser-proxy** -- Three actions:
- `top`: Top military/veteran podcasts sorted by power_score
- `search`: Search with military keyword filtering
- `podcast`: Single podcast detail lookup
- Results cached in `podchaser_cache` table with 48-hour TTL
- Uses a hardcoded list of military keywords for relevance filtering

**social-connect** -- Three actions:
- `create-user`: Register user on Upload Post (`vpa-{userId.slice(0,12)}`)
- `get-user`: Check connected platforms
- `generate-connect-url`: Generate OAuth URL for connecting a social account

**create-ticket-checkout** -- Accepts `programId`, `lines` array (ticket type + quantity), `buyerName`, `buyerEmail`. Creates `pending` purchase record, returns Stripe checkout URL.

**stripe-tickets-webhook** -- On `checkout.session.completed`: updates purchase status to `completed`, increments `quantity_sold`, sends QR confirmation email via Resend.

**send-campaign** -- Personalizes with `{{name}}`, `{{podcast_name}}`, `{{email}}` merge tags. Adds tracking pixel and wraps links for click tracking. Creates `email_sends` records per recipient.

---

## 8. Third-Party Integrations

### Supabase
- **URL:** `https://snhrqbtwahgarxxbizsz.supabase.co`
- **Project ID:** `snhrqbtwahgarxxbizsz`
- Database, Auth, Storage, Edge Functions
- Session persistence via localStorage with auto-refresh

### Stripe
- Checkout Sessions for ticket purchasing
- Webhook for payment fulfillment (`stripe-tickets-webhook`)
- API version: `2023-10-16`

### Resend
- All transactional and campaign emails
- Sends from `hello@veteranpodcastawards.com`
- Signed by "Riccoh Player, CEO & Founder"

### Podchaser
- REST API v1 at `developers.podchaser.com/api/rest/v1`
- Podcast search, discovery, and metadata
- Results cached for 48 hours in `podchaser_cache`

### Upload Post
- API at `api.upload-post.com`
- Social media account connection (OAuth)
- Cross-platform social posting

### Lovable AI Gateway
- Endpoint: `ai.gateway.lovable.dev/v1/chat/completions`
- Model: `google/gemini-2.5-flash`
- Powers the podcast discovery chatbot

### Google OAuth
- Sign-in with Google via Supabase Auth

### QR Server API
- `api.qrserver.com` for generating ticket QR codes

---

## 9. Theme System

**Implementation:** Custom React context in [useTheme.tsx](src/hooks/useTheme.tsx).

**Three modes:** `light`, `dark`, `system`
- Default is `dark` (marketing site)
- Stored in localStorage as `vpa-theme`
- Adds/removes `light` or `dark` class on `document.documentElement`
- Tailwind uses `darkMode: ["class"]`

**CSS variables** defined in [index.css](src/index.css):
- `:root` = light theme values
- `.dark` = dark theme overrides
- Brand gold: HSL 43, 72% saturation
- Custom gradients: `--gradient-gold`, `--gradient-dark`, `--gradient-gold-subtle`
- Custom shadows: `--shadow-gold`, `--shadow-gold-sm`, `--shadow-dark`

**Dashboard override:** The dashboard forces light mode regardless of global theme setting. Dashboard.tsx, Admin.tsx, and Onboarding.tsx each call `setTheme("light")` via the ThemeProvider on mount (saving the previous theme to restore on unmount). **Critical:** direct classList manipulation (`root.classList.remove("dark")`) does NOT work here — the ThemeProvider's own `useEffect` fires after and re-applies the stored theme, overwriting manual changes. Always use `setTheme()` from `useTheme()` for forced light mode. Dashboard components use explicit Tailwind colors (`bg-white`, `text-slate-900`, `border-slate-200`, etc.) instead of CSS variables.

**Toggle components** in [ThemeToggle.tsx](src/components/theme/ThemeToggle.tsx):
- `ThemeToggle` -- Dropdown menu (used in Header)
- `ThemeSelector` -- Three-button toggle (used in Dashboard Settings)

---

## 10. Dashboard Architecture

The dashboard ([Dashboard.tsx](src/pages/Dashboard.tsx)) is a single-page component with sidebar navigation and 9 sections:

| Section | Component | Description |
|---------|-----------|-------------|
| `home` | `DashboardHome` | Stats, quick actions, connected accounts, key dates |
| `profile` | (inline) | Consolidated profile editor -- single card with 6 sections |
| `inbox` | (inline) | Message list with read/unread, reply triggers email |
| `votes` | (inline) | Voting history with podcast images and category names |
| `favorites` | (inline) | Favorited podcasts list |
| `connectors` | `ConnectorsSection` | Upload Post OAuth flow for social accounts |
| `contacts` | (inline) | Follower/contact list (podcasters only) |
| `promotion` | `ShareSection` | 3-step promotion flow: voting link, post creator, assets |
| `settings` | (inline) | Appearance only (Day/Night/Auto theme picker) |

**Sidebar navigation:**
- White background with amber active states (`bg-amber-50 text-amber-700`)
- "Podcast Awards" group header separates core nav from awards-related items
- VPA logo at top, Settings and Log Out pinned to bottom
- Mobile: slides in from left with overlay

**Profile section** -- Single card with divider-separated sections:
1. Personal (Full Name, Website)
2. Military Affiliation (Affiliation + Branch side by side) -- podcasters only
3. Bio (textarea)
4. Podcast Details (Podcast Name, Hosting Platform, RSS Feed) -- podcasters only
5. Award Categories (read-only badges showing selected categories) -- podcasters only
6. Public Profile (is_public toggle, allow_contact toggle, username_slug input)
7. One "Save Changes" button at bottom

**User types and visibility:**
- `podcaster`: Sees all sections including Connectors, Contacts, Promotion
- `fan`/`voter`: Sees Home, Profile, Inbox, Votes, Favorites, Settings
- Admin users see all plus can access `/admin`

---

## 11. Admin Panel

The admin panel ([Admin.tsx](src/pages/Admin.tsx)) is tab-based with 12 sections, all role-gated to `admin` role:

| Tab | Component | Description |
|-----|-----------|-------------|
| Users | `UserManager` | View/manage users, assign roles |
| Awards | `AwardsManager` | Manage programs, categories, view votes/nominations |
| Tickets | `AwardTicketsAdmin` | Manage ticket types, view purchases |
| Podcasts | `PodcastManager` | CRUD podcasts, toggle active status |
| Contacts | `ContactManager` | Full CRM: import contacts, smart lists, mailing lists |
| Email | `EmailMarketingPanel` | Create/send campaigns with merge tags and tracking |
| Sponsors | `SponsorForm` + `SponsorList` | Manage sponsors (tiers, logos, ordering) |
| Submissions | `SubmissionManager` | Review public podcast submissions |
| Metrics | `BusinessMetricsPanel` | Dashboard with user/podcast/vote/email counts |
| Security | `SecurityPanel` | Security configuration |
| Tech | `TechStackPanel` | Tech stack documentation |
| Investors | Tabbed sub-panel | Access codes, share links, videos, engagement data |

---

## 12. Key Components

### Home Page
- **[Hero.tsx](src/components/home/Hero.tsx)** -- Landing hero with CTA
- **[HowItWorks.tsx](src/components/home/HowItWorks.tsx)** -- 50/50 grid: microphone image (left) blending into 4-step process (right). Image uses `object-[50%_48%]` for centering with gradient edge blending.
- **[CallToAction.tsx](src/components/home/CallToAction.tsx)** -- Bottom CTA section
- **[CountdownTimer.tsx](src/components/home/CountdownTimer.tsx)** -- Live countdown to event date

### Dashboard
- **[DashboardHome.tsx](src/components/dashboard/DashboardHome.tsx)** -- Stats grid, quick actions, connected accounts bar, key dates cards. Uses explicit white/slate/amber Tailwind classes for light theme.
- **[ShareSection.tsx](src/components/dashboard/ShareSection.tsx)** -- 3-step promotion flow: (1) voting link with copy, (2) post composer with template chips and platform pills, (3) promotional assets (Coming Soon). Integrates with Upload Post for social posting.
- **[ConnectorsSection.tsx](src/components/dashboard/ConnectorsSection.tsx)** -- OAuth flow to connect social accounts via Upload Post
- **[GetNominatedSection.tsx](src/components/dashboard/GetNominatedSection.tsx)** -- Self-nomination into up to 3 award categories

### Podcasts
- **[PodcastChatbot.tsx](src/components/podcasts/PodcastChatbot.tsx)** -- AI-powered chatbot using SSE streaming from `podcast-assistant` edge function
- **[PodchaserDiscoverSection.tsx](src/components/podcasts/PodchaserDiscoverSection.tsx)** -- Browse/search Podchaser directory via `podchaser-proxy`

### Layout
- **[Header.tsx](src/components/layout/Header.tsx)** -- Fixed nav bar with links, theme toggle, user dropdown, mobile menu
- **[Footer.tsx](src/components/layout/Footer.tsx)** -- Site footer

---

## 13. Environment Variables

### Frontend (.env file)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (`https://snhrqbtwahgarxxbizsz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Legacy alias for anon key (fallback) |

### Edge Functions (set in Supabase Dashboard)

| Variable | Used By | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | All | Auto-provided by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | All | Auto-provided by Supabase |
| `SUPABASE_ANON_KEY` | send-demo-email | Anon key for client auth |
| `RESEND_API_KEY` | send-welcome-email, send-campaign, send-demo-email, send-podcaster-contact, stripe-tickets-webhook | Resend email API key |
| `PODCHASER_API_KEY` | podchaser-proxy | Podchaser REST API key |
| `STRIPE_SECRET_KEY` | create-ticket-checkout, stripe-tickets-webhook | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | stripe-tickets-webhook | Stripe webhook signing secret |
| `PUBLIC_SITE_URL` | stripe-tickets-webhook, create-ticket-checkout | Defaults to `https://veteranpodcastawards.com` |
| `UPLOAD_POST_API_KEY` | social-connect, social-post | Upload Post API key |
| `LOVABLE_API_KEY` | podcast-assistant | Lovable AI gateway key |

---

## 14. Deployment

### Vercel (Frontend)
- **Scope:** `podlogix`
- **Config:** [vercel.json](vercel.json) -- single SPA rewrite (`/(.*) -> /index.html`)
- **Deploy command:** `vercel --prod --yes --scope podlogix`
- **Domain:** `veteranpodcastawards.com`

### Supabase (Backend)
- **Project ID:** `snhrqbtwahgarxxbizsz`
- **Deploy edge function:** `supabase functions deploy <function-name>`
- **Deploy all functions:** `supabase functions deploy`
- **JWT settings:** Configured in [supabase/config.toml](supabase/config.toml) per function
- **Migrations:** `supabase db push` or `supabase migration up`

### Build & Dev

```bash
# Development server (port 8080)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

---

## 15. Key Dates

| Event | Date | Notes |
|-------|------|-------|
| **Voting Opens** | October 5, 2026 | National Military Podcast Day |
| **Awards Ceremony** | November 11, 2026 | Veterans Day, 6:00 PM ET, Livestreamed |

These dates are referenced in `DashboardHome.tsx`, `CountdownTimer.tsx`, and various marketing components.

---

## 16. Recent Changes (August 2026 Session)

### Dashboard Light Theme Redesign
- Converted entire dashboard from dark theme to clean white/light professional design
- Added `useEffect` in Dashboard.tsx that forces light mode (removes `dark` class, adds `light`) on mount and restores on unmount
- Sidebar restyled: `bg-white` with `border-slate-200`, amber active states (`bg-amber-50 text-amber-700`), slate inactive states
- Main content area uses `bg-slate-50` background
- All dashboard sub-components updated with explicit light-friendly colors

**Commit:** `e818944 Redesign dashboard with clean white/light professional theme`

### Dashboard Profile Consolidation
- Merged 5 separate profile cards into 1 unified card with section dividers (`border-t`)
- Sections: Personal, Podcast Details, Military Affiliation, Award Categories, Public Profile
- Single "Save Changes" button at bottom
- Moved Public Profile, Allow Messages, and Profile URL from Settings into Profile

**Commit:** `15b94b9 Consolidate dashboard profile, redesign promotion page, center mic in How It Works`

### Settings Simplification
- Stripped Settings section down to only the Appearance card (Day/Night/Auto theme picker)
- All profile-related settings moved to Profile section

### Promotion Page Redesign
- Replaced cluttered multi-card layout with clean 3-step flow
- Step 1: Voting link display with monospace URL and Copy button
- Step 2: Post composer with template chips (Nomination Announcement, Call to Vote, Countdown), compose textarea with 280-char counter, platform pills with brand colors
- Step 3: Promotional assets grid (Nominee Badge, Social Banner, Story Template) -- all "Coming Soon"
- Upload Post attribution footer

**Commit:** `15b94b9` (same as above)

### How It Works Section
- Changed grid from 40/60 to 50/50 split (`lg:grid-cols-2`)
- Centered microphone image with `object-[50%_48%]`
- Added seamless gradient blending between columns

**Commits:** `a7ab7ad`, `15b94b9`

### Sidebar Restructure
- Added "Podcast Awards" group header above votes/favorites/nomination items
- Settings and Log Out pinned to sidebar bottom with border separator
- Mobile header uses white background with shadow

**Commit:** `f599bda Fix mic positioning, restructure sidebar with Podcast Awards group`

### Earlier August Changes
- **Onboarding flow:** 4-step podcaster onboarding with Podchaser search, military info, hosting platforms, category selection, confetti celebration
- **Podcast search:** Dual dropdown showing local directory results above Podchaser API results
- **RSS auto-detection:** Onboarding searches for RSS feeds automatically
- **Auth improvements:** Email verification with resend option, delayed welcome emails
- **Login redesign:** Split layout with image panel and rotating quotes

---

## 17. Known Issues & Remaining Work

### Needs Deployment
- [ ] Deploy updated `podchaser-proxy` edge function (`supabase functions deploy podchaser-proxy`) -- a `skipFilter` parameter was added but not deployed

### Needs Implementation
- [ ] Create actual promotional asset images (Nominee Badge, Social Banner, Story Template) -- currently "Coming Soon" placeholders in `ShareSection.tsx`
- [ ] Customize Supabase confirmation email template (currently uses Supabase default)
- [ ] Connected Accounts bar on DashboardHome shows avatar image from `social_images` field -- verify the Upload Post API actually returns a URL string in that field (may need to adjust the field name if avatars don't render)

### Housekeeping
- [ ] Add PDF files to `.gitignore` -- 5 licensing proposal PDFs in repo root should not be tracked:
  - `VPA_General_Licensing_Proposal_08-152026.pdf`
  - `VPA_General_Licensing_Proposal_2026.pdf`
  - `VPA_Licensing_7-2-26_Proposal_Joe_Ramirez copy.pdf`
  - `VPA_Licensing_7-2-26_Proposal_Joe_Ramirez.pdf`
  - `VPA_Licensing_Proposal_Joe_Ramirez.pdf`
- [ ] Fix CSS warning: `@import` for Google Fonts should be moved above `@tailwind` directives in `index.css`

### Known Quirks
- **Theme forcing:** MUST use `setTheme("light")` from `useTheme()`, NOT direct classList manipulation. The ThemeProvider's useEffect fires last and overwrites any raw classList changes. See Section 9.
- shadcn/ui primitive components (`<Input>`, `<Textarea>`, `<Select>`) use CSS variables (`bg-background`, `border-input`, etc.) internally. They render correctly in forced light mode when `setTheme("light")` is used properly, but will go dark if classList manipulation is used instead.
- Select dropdowns in the Profile section use raw HTML `<select>` with explicit Tailwind styling (not shadcn Select component) -- this is intentional and keeps them light regardless of theme.
- Browser screenshots render blank in dark mode due to CSS class-based theme system -- use DOM inspection or accessibility tree instead
- React controlled inputs don't respond well to programmatic value setting via browser automation tools (synthetic events don't trigger React state updates)

---

## 18. Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start dev server on port 8080
npm run dev

# Build for production
npm run build
```

### Supabase

```bash
# Link to project (first time)
supabase link --project-ref snhrqbtwahgarxxbizsz

# Deploy a specific edge function
supabase functions deploy <function-name>

# Push database migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --project-id snhrqbtwahgarxxbizsz > src/integrations/supabase/types.ts
```

### Vercel

```bash
# Deploy to production
vercel --prod --yes --scope podlogix

# Deploy preview
vercel --yes --scope podlogix
```

### Claude Code

The dev server is configured in `.claude/launch.json` as `vpa-dev` (runs `npm run dev` on port 8080).

---

## 19. Recent Changes (August 23, 2026 Session)

### Full Dashboard & Admin CSS Variable Cleanup

All pages behind the home page (Dashboard, Onboarding, Admin) were switched from CSS variable-based Tailwind classes to explicit white/slate/amber classes to eliminate warm cream/gold "pastel" tones and dark backgrounds.

**Root cause of the pastel look:** The light theme's CSS variables resolve to warm cream/gold tones (e.g., `--background: 45 30% 97%`, `--secondary: 45 25% 92%`). Classes like `bg-background`, `bg-secondary`, `text-muted-foreground`, `border-border` etc. were producing these tones even in "light" mode.

**Replacement mapping applied across all files:**
| Old class | New class |
|-----------|-----------|
| `text-foreground` | `text-slate-900` |
| `text-muted-foreground` | `text-slate-500` |
| `bg-background` | `bg-white` or `bg-slate-50` |
| `bg-secondary`, `bg-secondary/30` | `bg-slate-100` or `bg-slate-50` |
| `border-border` | `border-slate-200` |
| `bg-muted`, `bg-muted/50` | `bg-slate-100` or `bg-slate-50` |
| `bg-primary`, `bg-primary/10` | `bg-amber-500` or `bg-amber-50` |
| `text-primary` | `text-amber-600` |
| `border-primary` | `border-amber-500` |
| `ring-ring` | `ring-amber-400` |
| `border-input` | `border-slate-200` |
| `bg-card` | `bg-white` |

**Files updated:** `Dashboard.tsx`, `Onboarding.tsx`, `ShareSection.tsx`, `ConnectorsSection.tsx`, `DashboardHome.tsx`, `Admin.tsx`, and all 17 files in `src/components/admin/`.

**Commits:** `f868b91`, `1091dba`

---

### Onboarding Infinite Loop Fix

**Symptom:** Users were sent back to `/onboarding` on every login even after completing it.

**Root cause:** `handleSkip` in `Onboarding.tsx` fired the DB update but didn't await/catch errors. If the Supabase update failed silently, `onboarding_completed` stayed `false` in the DB. Dashboard's redirect useEffect then fetched the stale profile and redirected back.

**Fix applied:**
1. `Onboarding.tsx` — wrapped DB update in try/catch in both `handleSkip` and `handleComplete`. After either path, sets `localStorage.setItem("vpa-onboarding-done", user.id)` as a reliable client-side fallback.
2. `Dashboard.tsx` — modified the onboarding redirect check to also consult localStorage before redirecting:
   ```javascript
   if (user && localStorage.getItem("vpa-onboarding-done") === user.id) return;
   ```

**Commit:** `f868b91`

---

### Light Mode Fix (ThemeProvider)

**Symptom:** Dashboard, Profile, Admin, and Onboarding pages still rendered in dark mode after the CSS variable cleanup.

**Root cause:** The ThemeProvider (`src/hooks/useTheme.tsx`) defaults to `"dark"` and its `useEffect` calls `root.classList.remove("light", "dark"); root.classList.add(theme)` — this always runs AFTER our force-light effect and overwrites it. Direct classList manipulation cannot win against the ThemeProvider.

**Fix:** Dashboard.tsx, Admin.tsx, and Onboarding.tsx now call `setTheme("light")` via `useTheme()` on mount and restore the previous theme on unmount:
```javascript
useEffect(() => {
  const prev = (localStorage.getItem("vpa-theme") || "dark") as "light" | "dark" | "system";
  setTheme("light");
  return () => { setTheme(prev); };
}, []);
```

**Commit:** `4756d45`

---

### Promotion Page: 8 Campaign Templates

Expanded `ShareSection.tsx` from 3 to 8 campaign templates with emoji labels in a 2×4 grid:
1. 🎙️ Nomination Announcement
2. 🗳️ Call to Vote
3. ❤️ Personal Story
4. ⏰ 1 Week Left
5. 🔥 Final Push
6. 🙏 Thank Your Audience
7. 🎖️ Watch Party — Nov 11
8. 📻 Episode Promo

**Commit:** `f868b91`

---

### DashboardHome: Removed Pastel Backgrounds

- Stat card icon backgrounds: colored pastel (`bg-pink-50`, `bg-amber-50`, etc.) → neutral `bg-slate-100`
- Quick action icon backgrounds: `bg-amber-50` → `bg-slate-100`
- Upcoming event cards: `bg-amber-50 border-amber-100` → `bg-slate-50 border-slate-200`
- Connect social prompt: amber → slate
- Connected account cards redesigned: show avatar image (`social_images`) as circle with platform icon badge overlaid at bottom-right. Falls back to platform-colored icon circle if no avatar.

**Commit:** `e752ff0`

---

### Connectors Page: Proper Platform Icons

Replaced generic `Share2` icon for TikTok, Threads, Pinterest, Reddit, and Google Business with inline SVG components matching each platform's actual logo. Also fixed all CSS variable classes in `ConnectorsSection.tsx`.

**Commit:** `d336b52`

---

### Profile Page: Section Reorder

Changed the Profile form section order to:
1. Personal (Full Name, Website)
2. Military Affiliation
3. Bio
4. Podcast Details
5. Award Categories
6. Public Profile

Previously, Military Affiliation appeared after Podcast Details.

**Commit:** `d336b52`

---

*This document was last updated August 23, 2026.*
