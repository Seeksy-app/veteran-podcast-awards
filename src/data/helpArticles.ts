// Help Desk content. Static for now — no live-DB dependency, so an article
// update ships with a normal deploy instead of a migration.

export type HelpBlock =
  | { type: "heading"; text: string }
  | { type: "p"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "note"; text: string }
  | { type: "screenshot"; caption: string };

export interface HelpArticle {
  slug: string;
  title: string;
  audience: "admin" | "support" | "both";
  summary: string;
  blocks: HelpBlock[];
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "podcaster-onboarding-walkthrough",
    title: "Podcaster Onboarding Walkthrough",
    audience: "both",
    summary:
      "Step-by-step tour of what a podcaster sees from sign-up through their first category entry — use this to answer 'how do I...' questions or to spot where someone got stuck.",
    blocks: [
      {
        type: "note",
        text: "Screenshot placeholders are marked below. This article was written up from a live test signup; drop real screenshots into each placeholder next time one is captured to a file.",
      },
      { type: "heading", text: "1. Create an account" },
      {
        type: "p",
        text: "On /auth, a new podcaster fills in Full Name, Email, and Password, and picks \"I am a...\" → Podcaster (vs. Fan). Tapping \"Create Account\" submits the sign-up.",
      },
      { type: "screenshot", caption: "Auth page — Create your account form, Podcaster role selected" },
      { type: "heading", text: "2. Check your email" },
      {
        type: "p",
        text: "The form is replaced with a \"Check your email\" confirmation screen. The account isn't usable until the podcaster clicks the confirmation link Supabase Auth emails them.",
      },
      { type: "screenshot", caption: "\"Check your email\" confirmation screen" },
      {
        type: "note",
        text: "If a test account never receives the email (e.g. a synthetic inbox), an admin can confirm it manually in the zkru Supabase SQL editor: UPDATE auth.users SET email_confirmed_at = now() WHERE email = '...' AND email_confirmed_at IS NULL;",
      },
      { type: "heading", text: "3. Sign in" },
      {
        type: "p",
        text: "After confirming, the podcaster signs in on /auth. Because their profile is user_type = \"podcaster\" and onboarding_completed is still false, they're redirected straight into /onboarding instead of the dashboard.",
      },
      { type: "heading", text: "4. Onboarding — Step 1: Find your podcast" },
      {
        type: "p",
        text: "\"Find your podcast\" — search by name, or paste an RSS feed URL directly. Pasting a valid RSS URL fetches the feed and shows a confirmation card (cover art, show title) so the podcaster can verify it's the right show before continuing.",
      },
      { type: "screenshot", caption: "Step 1 — RSS URL pasted, show confirmation card shown" },
      { type: "heading", text: "5. Onboarding — Step 2: About You" },
      {
        type: "p",
        text: "\"About You\" — military affiliation (Veteran, Active Duty, Military Spouse, Military Supporter, Other) and branch. This is required before the podcaster can advance.",
      },
      { type: "screenshot", caption: "Step 2 — About You / military affiliation" },
      { type: "heading", text: "6. Onboarding — Step 3: Hosting & Distribution" },
      {
        type: "p",
        text: "\"Hosting & Distribution\" — where the show is currently hosted, plus which listening platforms it's distributed to (Apple Podcasts, Spotify, YouTube, Amazon Music, iHeartRadio, and others).",
      },
      { type: "screenshot", caption: "Step 3 — Hosting & Distribution" },
      { type: "heading", text: "7. Onboarding — Step 4: Awards & Opportunities" },
      {
        type: "p",
        text: "\"Awards & Opportunities\" — pick up to 3 award categories for the current season, plus sponsorship/agency interest questions. Completing this step writes the category picks to the profile, links (or creates) the podcasts row from the saved RSS via the claim_my_podcast() RPC, and inserts matching nominations rows so the picks immediately appear on public voting pages.",
      },
      { type: "screenshot", caption: "Step 4 — Awards & Opportunities, categories selected" },
      { type: "heading", text: "8. Welcome celebration" },
      {
        type: "p",
        text: "Completing onboarding routes to /dashboard?welcome=1, which shows a one-time WelcomeCelebration overlay before landing on the normal dashboard home.",
      },
      { type: "screenshot", caption: "Welcome celebration overlay on first dashboard load" },
      {
        type: "note",
        text: "If a podcaster ever needs to redo or fix their category picks later, that's the My Categories tab in the dashboard sidebar — up to 3 categories, locked automatically once voting opens (award_programs.voting_open_at).",
      },
    ],
  },
];
