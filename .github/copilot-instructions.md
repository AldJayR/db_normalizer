# AI Coding Agent Instructions - Database Normalization System

## Project Overview

**db_normalizer** is a full-stack web application that automates database schema normalization using AI (Google Gemini). Users input database attributes and business rules; the system decomposes them through 1NF → 2NF → 3NF, generating normalized table schemas with verification of lossless joins and dependency preservation.

## Architecture

### Client-Server Split
- **Frontend** (`client/`): React 19 + TypeScript + Vite + TailwindCSS. SPA that collects user input and displays normalized schemas.
- **Backend** (`server/`): Fastify + TypeScript. Single `/api/normalize` endpoint that sends user input to Gemini API and returns structured JSON.
- **Communication**: POST request with `{ attributes: string, businessRules?: string }` → JSON response matching `NormalizationResult` type.

### Data Flow
1. User enters comma-separated attributes and optional business rules in `InputForm`
2. `App.tsx` POSTs to `${VITE_API_URL}/api/normalize` (env-configurable)
3. Server validates input (max 5000 chars attributes, 10000 chars rules) and constructs Gemini prompt
4. Gemini returns JSON with parsed FDs, candidate keys, and 1NF/2NF/3NF decompositions
5. `ResultsDisplay` renders six components: BusinessRules, FunctionalDependencies, CandidateKeys, three NormalizationStep views (1NF/2NF/3NF), and Verification

## Key Files & Patterns

### Type Definitions (`client/src/types.ts`)
Central contract for all responses. Key interfaces:
- `NormalizationResult`: Root response containing businessRules[], functionalDependencies[], candidateKeys[], normalization (1NF/2NF/3NF), verification
- `NormalizationStepData`: Describes each normal form with tables[], partialDependencies?[], transitiveDependencies?[], notes?[]
- `Table`: Has name, attributes[], primaryKey[], foreignKeys[] (references string + attributes)
- `FunctionalDependency`: { left, right, explanation } where left/right are string arrays

**When adding features**: Update types.ts first, then ensure client/server align with new structure.

### Server Prompt Engineering (`server/index.ts`, lines 43-100+)
The Gemini prompt is the system's "brain". Key requirements:
- **Always** request JSON-only response (no markdown/code blocks) to enable direct JSON parsing
- **Validate inputs**: Enforce character limits (5000 attrs, 10000 rules) before calling API to save costs
- **Graceful fallback**: If businessRules empty, prompt Gemini to "infer realistic business rules based on attribute names"
- **Explicit steps**: Prompt enumerates steps (1-8) to guide Gemini output structure
- **Error handling**: Wrap Gemini calls in try-catch; return 400 with error.message for validation, 500 for Gemini failures

### Component Hierarchy
- `App.tsx`: State manager (attributes, businessRules, results, error, step). Handles API calls and step navigation.
- `InputForm.tsx`: Two textareas + submit button. Clears error on user input changes.
- `ResultsDisplay.tsx`: Maps over ['1NF', '2NF', '3NF'] and renders child components.
- Individual display components (`BusinessRules.tsx`, `FunctionalDependencies.tsx`, `CandidateKeys.tsx`, `NormalizationStep.tsx`, `Verification.tsx`): Render results data. Use Lucide icons (imported from 'lucide-react').
- `ErrorMessage.tsx`: Conditionally renders error div with consistent styling.

**Pattern**: Props are immutable; state lives in App. Display components never fetch or mutate.

### Styling
Tailwind CSS only. No CSS modules or styled-components. Utilities directly in classNames:
- Color scheme: blue/indigo gradients for backgrounds, gray for neutral UI
- Responsive: `md:` breakpoints for tablet+
- Examples: `bg-gradient-to-br from-blue-50 to-indigo-100`, `md:p-8`, `focus:ring-2 focus:ring-indigo-500`

## Development Workflow

### Prerequisites
- Node.js 18+, pnpm 10.12.1+ (lockfile-managed)
- `.env` files: Copy `.env.example` to `.env` in both client/ and server/ and populate `VITE_API_URL` (client) and `GEMINI_API_KEY`, `CORS_ORIGIN` (server)

### Local Development
```bash
# Terminal 1: Backend (port 3001)
cd server && pnpm install && pnpm run dev

# Terminal 2: Frontend (port 5173)
cd client && pnpm install && pnpm run dev
```
Visit http://localhost:5173. Hot reload enabled on both.

### Build & Production
```bash
# Backend: Compiles TS to dist/, runs from there
cd server && pnpm run build && pnpm start

# Frontend: Generates optimized dist/
cd client && pnpm run build  # Output in client/dist/
```

### Linting
Linting and formatting uses Biome. Repo config lives in `biome.json`, JavaScript strings prefer single quotes.

```bash
cd client && pnpm run lint
cd client && pnpm run format

cd server && pnpm run lint
cd server && pnpm run format
```

## Critical Patterns & Conventions

### Type Safety
- **Strict TypeScript**: tsconfig.json enables strict mode. No `any` types; use generics or union types.
- **Request/Response**: All API responses must match `NormalizationResult`. Mock early in tests if needed.

### Error Handling
- **Client**: Try-catch in `processNormalization()` with user-facing error messages. Distinguish network errors from Gemini errors.
- **Server**: Input validation → 400 errors; Gemini failures → 500. Always include error.message in JSON response.
- **UI Feedback**: `isProcessing` boolean disables submit button during fetch. `error` state shown in `ErrorMessage` component.

### Environment Variables
- **Client**: `VITE_API_URL` (required for production; defaults to localhost:3001 in code)
- **Server**: `GEMINI_API_KEY` (required, exit(1) if missing), `PORT`, `HOST`, `CORS_ORIGIN` (comma-separated list)
- **CORS**: Frontend origin must be in server's CORS_ORIGIN list or requests fail silently

### Input Validation
- **Client**: Check attributes.trim() before POST; show inline error via setError()
- **Server**: Hard limits (5000 chars attributes, 10000 chars rules) to prevent token bloat; reject with 400 before Gemini call
- **Gemini**: Prompt explicitly states to infer rules if none provided; handles freeform business rule text

## Common Tasks

### Adding a New Normalization Step (e.g., BCNF)
1. Update `server/index.ts` prompt to generate BCNF
2. Update `NormalizationResult.normalization` type to include `BCNF: NormalizationStepData`
3. In `ResultsDisplay.tsx`, add BCNF to the map array: `{['1NF', '2NF', '3NF', 'BCNF'].map(...)}`

### Modifying Gemini Prompt
- Edit `server/index.ts` lines ~60–120 (the prompt string)
- Test with sample data from `TEST_PROMPT.md`
- Ensure JSON response format is preserved (no markdown wrapper)

### Adding UI Features
- Create new component in `client/src/components/`
- Update `types.ts` if new data structure needed
- Import in relevant parent (likely `ResultsDisplay` or `App`)
- Use TailwindCSS utilities; test responsiveness on mobile

### Debugging Gemini Responses
- Check `server/` logs for full API response before JSON parse
- Validate response against `NormalizationResult` type
- If parse fails, Gemini may have added markdown wrapper; adjust prompt to enforce JSON-only

## Deployment Notes

- Backend runs on configurable PORT (default 3001); production typically reverse-proxied behind web server
- Frontend requires build step; static dist/ output suitable for S3 / CDN
- CORS configured per environment; update CORS_ORIGIN for new domains
- Gemini API key is rate-limited; monitor costs if heavy usage expected
