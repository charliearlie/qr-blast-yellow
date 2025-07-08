# QR Blast Development Instructions

## Project Overview
QR Blast is a dynamic QR code generation platform with advanced features like time-based rules, geo-fencing, and scan limits. The application uses React, TypeScript, Supabase, and follows a Test-Driven Development (TDD) approach.

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

## Important Notes
- Always follow TDD approach for new features
- Maintain consistency with existing code patterns
- Document complex logic with clear comments
- Ensure all pro features are properly paywalled
- Test edge cases and error scenarios