# GunsmithLocal

A Western-themed directory for finding professional gunsmiths in your area.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `env.example` to `.env.local`
   - Add your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Run the development server:
   ```bash
   npm run dev
   ```

## Supabase Schema Required

Please provide the structure of your `listings` table so I can properly integrate it. The app expects at minimum:
- id
- business_name
- description
- address/location fields
- contact information

## Deployment

This project is configured for deployment on Vercel with GitHub integration.
