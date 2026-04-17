# TruPaws — Claude Code Rules

## GOLDEN RULE
Only touch files directly related to the task given. Never rewrite, refactor, or "improve" files that weren't asked about.

## How to make changes
- Read ONLY the specific file(s) needed for the task
- Make the minimum change required — surgical edits only
- Use str_replace or targeted edits, NOT full file rewrites
- If a file is over 100 lines, patch it — never rewrite the whole thing
- After each change, stop and confirm before touching another file

## File structure
- Pages: src/pages/
- Components: src/components/
- Supabase client: src/supabaseClient.js
- Routing: src/App.js (add routes only — do not touch anything else)
- Styles: inline styles only, matching TruPaws brand colours

## Brand colours
- Forest green: #2D5016
- Cream: #F5F0E8
- Gold: #D4A853

## Tech stack
- React (create-react-app)
- Supabase (auth + database)
- Framer Motion + GSAP
- React Router v6

## Supabase tables
- profiles, sitter_profiles, contact_requests, messages

## DO NOT
- Do not run npm install for packages already in package.json
- Do not rewrite App.js from scratch
- Do not touch files unrelated to the current task
- Do not add new dependencies without being asked
- Do not refactor working code

## When adding a new page
1. Create src/pages/NewPage.js
2. Add ONE route line to App.js
3. Add ONE nav link if needed
4. Stop.

## When fixing a bug
1. Read only the broken file
2. Make only the fix
3. Do not clean up surrounding code
