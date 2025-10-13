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


## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js rules
- `npx shadcn@2.9.2 add [component-name]` - Add shadcn/ui components
- `npx drizzle-kit push` - Push database migrations with Drizzle ORM
- `npx drizzle-kit studio` - View tables in database
- `npx @better-auth/cli@1.2.12 generate` - Generate Better Auth types and configuration
- `npx tsx --env-file=.env src/db/seed.ts` - Run database seed script


## Routes

**Public Routes:**
- `/` - Home page with product listings
- `/product` - Product browsing page
- `/product-variant/[slug]` - Individual product variant detail page (dynamic)
- `/category/[slug]` - Category-filtered product listing (dynamic)
- `/auth` - Authentication page with sign-in/sign-up tabs
- `/auth/forgot-password` - Password reset request page
- `/auth/reset-password` - Password reset landing page
- `/auth/reset-password/[token]` - Password reset with token verification (dynamic)

**Protected Routes (require authentication):**
- `/cart/identification` - Cart checkout page with shipping address selection/creation

**API Routes:**
- `/api/auth/[...all]` - Better Auth API endpoints (catch-all for all auth operations)


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
- `src/app/product/page.tsx` - Product page
- `src/app/product-variant/[slug]/page.tsx` - Product variant detail page with dynamic slug
- `src/app/category/[slug]/page.tsx` - Category page with dynamic slug
- `src/app/cart/identification/page.tsx` - Cart identification and shipping address page
- `src/app/cart/identification/components/` - Cart identification components
- `src/app/cart/identification/components/add-address-form.tsx` - Form to add shipping address
- `src/app/cart/identification/components/addresses.tsx` - Display shipping addresses
- `src/app/cart/identification/components/summary-cart-order.tsx` - Cart order summary component
- `src/app/auth/` - Authentication pages and components
- `src/app/auth/page.tsx` - Auth page with sign-in/sign-up tabs
- `src/app/auth/components/` - Auth-specific components
- `src/app/auth/forgot-password/page.tsx` - Forgot password page
- `src/app/auth/reset-password/page.tsx` - Reset password page
- `src/app/auth/reset-password/[token]/page.tsx` - Dynamic reset password with token
- `src/app/api/auth/[...all]/route.ts` - Better Auth API routes
- `src/components/` - Shared components
- `src/components/ui/` - shadcn/ui components (button, card, form, input, label, tabs, sonner, avatar, carousel, separator, scroll-area, sheet, radio-group)
- `src/components/header.tsx` - Application header component
- `src/components/footer.tsx` - Application footer component
- `src/components/cart.tsx` - Shopping cart component
- `src/components/cart-item.tsx` - Cart item component
- `src/components/product-list.tsx` - Product list display component
- `src/components/product-item.tsx` - Individual product item component
- `src/components/product-category-selector.tsx` - Category selector component
- `src/components/carousel-ui.tsx` - Custom carousel UI component
- `src/components/emails/` - Email-related components and forms
- `src/components/emails/forgot-password-form.tsx` - Forgot password form component
- `src/components/emails/reset-password-form.tsx` - Reset password form component
- `src/actions/` - Server actions for data mutations
- `src/actions/get-cart/index.ts` - Server action to fetch cart
- `src/actions/add-cart-product/` - Add product to cart action with schema
- `src/actions/remove-cart-product/` - Remove product from cart action with schema
- `src/actions/decrease-cart-product/` - Decrease product quantity action with schema
- `src/actions/get-shipping-addresses/index.ts` - Fetch shipping addresses action
- `src/actions/create-shipping-address/` - Create shipping address action with schema
- `src/actions/update-cart-shipping-address/` - Update cart shipping address action with schema
- `src/hooks/` - Custom React hooks
- `src/hooks/queries/use-cart.ts` - React Query hook for cart data
- `src/hooks/queries/use-shipping-addresses.ts` - React Query hook for shipping addresses
- `src/hooks/mutations/use-increase-product-quantity-cart.ts` - Mutation hook to increase cart quantity
- `src/hooks/mutations/use-decrease-product-quantity-cart.ts` - Mutation hook to decrease cart quantity
- `src/hooks/mutations/use-remove-product-from-cart.ts` - Mutation hook to remove product from cart
- `src/hooks/mutations/use-create-shipping-address.ts` - Mutation hook to create shipping address
- `src/hooks/mutations/use-update-cart-shipping-address.ts` - Mutation hook to update cart shipping address
- `src/providers/` - React context providers
- `src/providers/react-query.tsx` - React Query provider configuration
- `src/lib/auth.ts` - Better Auth server configuration with Resend integration
- `src/lib/auth-client.ts` - Better Auth client configuration
- `src/lib/utils.ts` - Utility functions (includes `cn` helper for class merging)
- `src/db/` - Database configuration and seeding
- `src/db/index.ts` - Database connection and client
- `src/db/schema.ts` - Drizzle ORM database schema
- `src/db/seed.ts` - Database seeding script
- `components.json` - shadcn/ui configuration
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
- `shipping_address` - Shipping addresses (uuid id, userId, recipientName, street, number, complement, city, state, neighborhood, zipCode, country, phone, email, cpfOrCnpj, createdAt)
- `cart` - Shopping cart (uuid id, userId, shippingAddressesId, createdAt)
- `cart_item` - Cart items (uuid id, cartId, productVariantId, quantity, createdAt)

**Database Relations:**
- One-to-Many: Category → Products
- One-to-Many: Product → Product Variants
- One-to-Many: User → Sessions/Accounts
- One-to-Many: User → Shipping Addresses
- One-to-One: User → Cart
- One-to-Many: Cart → Cart Items
- One-to-One: Cart → Shipping Address (optional)
- Many-to-One: Cart Item → Product Variant
- Foreign Keys: userId, categoryId, productId, cartId, productVariantId, shippingAddressesId with cascade/set null policies

**Data Fetching & State Management:**
- React Query (TanStack Query) for server state management
- Custom hooks pattern for queries and mutations
- Server Actions for data mutations with schema validation
- React Query provider configured in `src/providers/react-query.tsx`
- Query hooks in `src/hooks/queries/` for data fetching
- Mutation hooks in `src/hooks/mutations/` for data updates

**Forms & Validation:**
- React Hook Form v7.62.0 for performant forms
- Zod v4.0.17 for schema validation
- @hookform/resolvers for Zod integration
- Server actions with Zod schemas for type-safe mutations

**Styling:**
- Uses TailwindCSS v4 with dark mode support
- CSS variables enabled for theme customization
- Geist font family (sans and mono variants)
- shadcn/ui provides consistent design system

**E-commerce Features:**
- Shopping cart functionality with add/remove/update quantity
- Product variants (color, size) with individual pricing
- Shipping address management for users
- Cart identification page for checkout flow
- Order summary with price calculations