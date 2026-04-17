# TruPaws — Dev State

## What's built and working
- Hero page with parallax and real dog photo (4 cinematic sections)
- Supabase auth — signup/login, two roles (pet_owner / sitter)
- Sitter dashboard — profile builder saves to sitter_profiles table
- Pet Owner dashboard — sitter search/browse
- Real-time messaging (flicker fixed with latest-ref pattern)
- Navbar — sign out, Hi [name], My Dashboard
- Browse Sitters page — public grid pulling from sitter_profiles (no login required)
- Sitter Profile page — full profile view at /sitter/:user_id
- React Router v6 — URL-based routing with ProtectedRoute for dashboards

## Build queue (in order)
1. ~~Browse Sitters page~~ ✅
2. ~~Fix message flicker in ChatPanel.js~~ ✅
3. ~~React Router + URL routing~~ ✅
4. Sitter photo upload via Supabase Storage
5. Booking system — bookings table (pending/accepted/completed)
6. Star ratings and reviews
7. Verified Local badge
8. Deploy to Vercel
9. Stripe Connect (10-15% cut)
10. Email notifications

## Known bugs
- Message flicker on send in ChatPanel.js
- Some navbar links not scrolling
- RLS disabled on sitter_profiles and messages — fix later

## Key sitters to onboard
- Penny Lavoie, MaryLou Barker, Melanie Grant
