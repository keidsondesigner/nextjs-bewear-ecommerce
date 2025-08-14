This is a [Next.js 15.4.1](https://nextjs.org) and Node 22 project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Overview

This is a Next.js 15.4.1 project with React 19.1.0 and TypeScript, created with `create-next-app` and configured with TailwindCSS v4. The project name is "bewear-bootcamp" and uses the App Router architecture with shadcn/ui components.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js rules
- `npx shadcn@2.9.2 add [component-name]` - Add shadcn/ui components
- `npx drizzle-kit push` - Push database migrations with Drizzle ORM
- `npx @better-auth/cli@1.2.12 generate` - Generate Better Auth types and configuration
- `npx tsx --env-file=.env src/db/seed.ts` - Run database seed script


## Architecture

**Framework Stack:**
- Next.js 15.4.1 with App Router
- React 19.1.0 with TypeScript
- TailwindCSS v4 with PostCSS plugin
- shadcn/ui 2.9.2 component library (New York style)
- Lucide React for icons
- Drizzle ORM v0.44.2 with PostgreSQL
- Better Auth v1.2.12 for authentication
- React Hook Form v7.62.0 with Zod v4.0.17 validation
- Sonner v2.0.7 for toast notifications
- next-themes v0.4.6 for theme management
- Resend v6.0.1 for email delivery service
- ESLint with Next.js core-web-vitals and TypeScript rules
- tsx v4.20.3 for TypeScript script execution

**File Structure:**
- `src/app/` - App Router pages and layouts
- `src/app/layout.tsx` - Root layout with Sonner Toaster
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles with TailwindCSS imports
- `src/components/ui/` - shadcn/ui components (button, card, form, input, label, tabs, sonner)
- `src/lib/utils.ts` - Utility functions (includes `cn` helper for class merging)
- `components.json` - shadcn/ui configuration
- `src/app/product/page.tsx` - Product page
- `src/app/auth/` - Authentication pages and components
- `src/app/auth/page.tsx` - Auth page with sign-in/sign-up tabs
- `src/app/auth/components/` - Auth-specific components
- `src/app/auth/forgot-password/page.tsx` - Forgot password page
- `src/app/auth/reset-password/page.tsx` - Reset password page
- `src/app/auth/reset-password/[token]/page.tsx` - Dynamic reset password with token
- `src/components/emails/` - Email-related components and forms
- `src/components/emails/forgot-password-form.tsx` - Forgot password form component
- `src/components/emails/reset-password-form.tsx` - Reset password form component
- `src/components/emails/reset-password-email.tsx` - Email template for password reset
- `src/app/api/auth/[...all]/route.ts` - Better Auth API routes
- `src/lib/auth.ts` - Better Auth server configuration with Resend integration
- `src/lib/auth-client.ts` - Better Auth client configuration
- `src/db/` - Database configuration and seeding
- `src/db/index.ts` - Database connection and client
- `src/db/schema.ts` - Drizzle ORM database schema
- `src/db/seed.ts` - Database seeding script
- `drizzle.config.ts` - Drizzle Kit configuration

**Configuration:**
- TypeScript with strict mode, ES2017 target
- Path alias `@/*` maps to `./src/*`
- PostCSS configured for TailwindCSS v4
- ESLint extends Next.js core-web-vitals and TypeScript rules
- shadcn/ui configured with New York style, RSC support, neutral base color
- Environment variables loaded via dotenv package

**Component System:**
- shadcn/ui components use `cn()` utility for class merging (clsx + tailwind-merge)
- Component aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`
- Install components with: `npx shadcn@latest add [component-name]`
- Lucide React for consistent iconography

**Authentication:**
- Better Auth v1.2.12 for modern authentication
- Integrates with Drizzle ORM for user data persistence
- Type-safe auth configuration with CLI generation
- Complete password reset functionality with email verification
- Resend integration for transactional emails

**Email Service:**
- Resend v6.0.1 for reliable email delivery
- Custom domain support (noreply@functiondev.com.br)
- HTML email templates for password reset
- Environment variable configuration (RESEND_API_KEY)

**Database:**
- Drizzle ORM v0.44.2 for type-safe database operations
- PostgreSQL database with pg driver v8.16.3
- Drizzle Kit v0.31.4 for migrations and schema management
- Drizzle Seed v0.3.1 for database seeding
- tsx v4.20.3 for running TypeScript scripts
- Environment variables for database connection

**Database Tables:**
- `user` - User authentication data (id, name, email, emailVerified, image, timestamps)
- `session` - User session management (id, token, expiresAt, ipAddress, userAgent, userId)
- `account` - OAuth/credential accounts (id, accountId, providerId, tokens, password, userId)
- `verification` - Email verification tokens (id, identifier, value, expiresAt, timestamps)
- `categories` - Product categories (uuid id, name, slug, createdAt)
- `products` - Product catalog (uuid id, name, slug, description, categoryId, createdAt)
- `product_variants` - Product variations (uuid id, name, slug, color, size, imageUrl, priceInCents, productId, createdAt)

**Database Relations:**
- One-to-Many: Category → Products
- One-to-Many: Product → Product Variants
- One-to-Many: User → Sessions/Accounts
- Foreign Keys: userId, categoryId, productId with cascade/set null policies

**Forms & Validation:**
- React Hook Form v7.62.0 for performant forms
- Zod v4.0.17 for schema validation
- @hookform/resolvers for Zod integration

**Styling:**
- Uses TailwindCSS v4 with dark mode support
- CSS variables enabled for theme customization
- Geist font family (sans and mono variants)
- shadcn/ui provides consistent design system