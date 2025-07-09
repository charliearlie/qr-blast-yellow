# QR Blast Development Instructions

## Project Overview
QR Blast is a dynamic QR code generation platform with advanced features like time-based rules, geo-fencing, and scan limits. The application uses React, TypeScript, Supabase, and follows a Test-Driven Development (TDD) approach.

## Tech Stack & Build Configuration

### Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite (with MDX support for blog)
- **Styling**: Tailwind CSS with "brutal" design system
- **UI Components**: Radix UI primitives + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **QR Generation**: qr-code-styling library
- **State Management**: React Context + React Query
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router v6

### Build Process
```bash
# Development
npm run dev              # Vite dev server on port 8080

# Production Build
npm run build           # Generates sitemap → Vite build → Blog HTML generation
npm run build:dev       # Same but with development mode

# Individual Scripts
npm run generate:sitemap     # Generate sitemap.xml
npm run generate:blog-html   # Generate static HTML for blog posts
```

### Key Configuration
- **Path Aliasing**: `@/` → `./src/`
- **Static Assets**: Served from `public/` directory
- **Environment**: Node >=18.19.0 or Bun >=1.0.0

## Project Structure

```
qr-blast-yellow/
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── __tests__/     # Component tests
│   ├── services/          # Business logic layer
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route components
│   ├── content/blog/      # MDX blog posts
│   └── integrations/      # External service configs
├── public/                # Static assets (ads.txt, favicon, etc.)
├── supabase/
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge Functions
├── scripts/               # Build utilities
└── dist/                  # Build output
```

## Routing Structure

### Public Routes
- `/` - Landing page
- `/login` - Authentication page
- `/blog` - Blog index
- `/blog/:slug` - Individual blog posts (MDX)
- `/r/:shortCode` - QR code redirect handler

### Protected Routes (Require Authentication)
- `/generate` - QR code generator
- `/dashboard` - User's QR code dashboard
- `/qr/:id` - QR code detail view
- `/analytics/:id` - Analytics dashboard
- `/edit/:id` - Edit QR code

All routes except login and redirect use the Layout wrapper component.

## Development Approach

### Test-Driven Development (TDD)
1. **Always write tests first** before implementing new features
2. **Red-Green-Refactor cycle**: 
   - Write failing tests (Red)
   - Write minimal code to pass tests (Green)
   - Refactor while keeping tests green
3. **Test file locations**:
   - Component tests: `src/components/__tests__/`
   - Service tests: `src/services/__tests__/`
   - Hook tests: `src/hooks/__tests__/`

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Key Testing Patterns
- Use `vitest` and `@testing-library/react` for component testing
- Mock Supabase client with `vi.mock('@/integrations/supabase/client')`
- Test user interactions and accessibility
- Ensure proper error handling in all tests

## Architecture Guidelines

### Pro Features Pattern
All premium features should:
1. Be wrapped in `ProFeatureGuard` component
2. Check user plan from `auth.users` metadata
3. Show upgrade prompt for free users
4. Follow existing patterns from TimeRuleManager and GeoRuleManager

### Database Migrations
- Location: `supabase/migrations/`
- Naming: `XXX_descriptive_name.sql` (e.g., `005_scan_limits.sql`)
- Always include RLS policies
- Test migrations locally before deployment

### Component Structure
- Use TypeScript interfaces for all props
- Follow existing component patterns
- Implement proper error boundaries
- Use proper loading and error states

### Security Best Practices
1. Never expose sensitive data in client-side code
2. Use RLS policies for all database operations
3. Validate all user inputs
4. Sanitize URLs and prevent XSS
5. Use Edge Functions for sensitive operations

## Current Feature Implementation: Scan-Limited QR Codes

### Overview
Implementing QR codes that expire after a set number of scans as a pro feature.

### Implementation Checklist
- [ ] Database migration for scan_limit and expired_url columns
- [ ] Master redirect RPC function with scan limit priority
- [ ] Update Edge Function to use master redirect
- [ ] ScanLimitManager component with tests
- [ ] Integration into QRGenerator with Limits tab
- [ ] Update qrService with scan limit CRUD operations
- [ ] Comprehensive test coverage for all new code

### Testing Priority
1. Database operations and RPC functions
2. Service layer methods
3. Component unit tests
4. Integration tests
5. Edge Function updates

## Running the Application

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Supabase locally
npx supabase start
```

### Before Committing
Always run these commands to ensure code quality:
```bash
npm run lint
npm run typecheck
npm test
```

## Key Features

### Free Features
- Basic QR code generation with URL input
- Customizable colors with contrast validation
- Shape customization (dots, corners, corner dots)
- Border styles and colors
- Logo upload capability
- Template selection
- Direct PNG download
- "Suggest from URL" automatic branding

### Pro Features (Currently Free with Authentication)
All pro features use `LoginWall` component for access control:

1. **Time-Based Rules** (`TimeRuleManager`)
   - Schedule different URLs by time of day
   - UTC time conversion
   - Multiple rules with labels

2. **Geo-Fencing** (`GeoRuleManager`)
   - Location-based redirects
   - Radius definition in kilometers
   - Multiple geo rules

3. **Scan Limits** (`ScanLimitManager`)
   - Set maximum scan count
   - Custom expired URL redirect
   - Scan tracking

4. **Branding Display** (`BrandingManager`)
   - Pre-redirect branding screen
   - Duration: 1-10 seconds
   - Styles: minimal, full, custom

## Database Schema

### Tables
1. **qr_codes**
   - id, user_id, title, original_url
   - short_code (unique), short_url
   - qr_settings (JSONB), scan_count
   - scan_limit, expired_url
   - branding_settings (JSONB)
   - timestamps

2. **qr_analytics**
   - id, qr_code_id, scanned_at
   - ip_address, user_agent, referer
   - country, city
   - device_type, browser

### Key Migrations
1. Core tables with RLS policies
2. Time-aware redirect function
3. Geo-aware redirect function
4. Time rules midnight fix
5. Scan limits feature
6. Master redirect function (consolidates all logic)
7. Branding settings

### Edge Functions
- **security-check**: URL validation and safety checks
- **geo-redirect-check**: Location-based redirect logic
- **url-inspector**: Favicon and theme extraction

## Core Components

### Main Components
- `QRGenerator`: Main QR creation interface with tabs
- `QRCodeManager`: Dashboard for saved QR codes
- `AnalyticsDashboard`: Detailed analytics view
- `QRCodePreview`: Live preview component

### Service Layer
- `qrService.ts`: CRUD operations for QR codes
- `securityService.ts`: URL security validation
- Analytics tracking and export

### Authentication
- Supabase Auth with Google OAuth
- `useAuth` hook for auth state
- User metadata stores plan info

## Important Notes
- Always follow TDD approach for new features
- Maintain consistency with existing code patterns
- Document complex logic with clear comments
- Ensure all pro features are properly paywalled
- Test edge cases and error scenarios
- Use LoginWall instead of ProFeatureGuard for feature gating
- All timestamps use UTC for consistency
- RLS policies enforce data isolation