# Proposal: Recipe Finder — Full Feature Implementation

## Change Name
`recipe-finder-mvp`

## Intent
Build a complete recipe finder web application with search, filtering, user authentication, and favorites — designed as a single-server Django app that serves the React frontend.

## Problem Statement
Users need a clean, fast, and secure way to discover recipes. Current state: basic skeleton with search-only functionality, no filters, no user accounts, no personalization.

## Scope

### In Scope
1. **Enhanced Search & Filtering**
   - Filter by ingredient (TheMealDB `filter.php?i=`)
   - Filter by category (TheMealDB `filter.php?c=`)
   - Filter by region/cuisine (TheMealDB `filter.php?a=`)
   - Ingredient list endpoint for autocomplete
   - Area/region list endpoint

2. **User Authentication**
   - Registration (email + password)
   - Login/Logout (JWT tokens via djangorestframework-simplejwt)
   - Token refresh
   - User profile (basic: email, date joined)

3. **Favorites System**
   - Authenticated users can save recipes as favorites
   - List favorites
   - Remove favorites
   - Check if recipe is favorited (for UI state)

4. **Security Hardening (Reasonable Level)**
   - Content-Security-Policy headers (django-csp)
   - Input sanitization on all query parameters
   - Error responses that don't leak internal info
   - Security headers active in ALL environments (not just prod)
   - Dependency vulnerability check instructions

5. **Single-Server Deployment**
   - Django serves the React production build as static files
   - WhiteNoise for static file serving
   - Single `manage.py runserver` for dev, gunicorn for prod
   - SQLite for dev, ready for PostgreSQL in prod

6. **Frontend Polish**
   - Filter sidebar/controls on search results
   - Favorites page
   - Login/Register pages
   - Responsive design (mobile-first)
   - Loading states and error handling
   - Skeleton loaders

### Out of Scope (for now)
- Multi-ingredient filtering (premium API)
- Recipe creation by users
- Social features (comments, ratings)
- Email verification
- Password reset flow (can be added later)
- Admin panel customization
- CI/CD pipeline
- Docker setup

## Approach

### Architecture Decision: Monolithic Django
Django serves both the API and the React production build. This means:
- One server to deploy and manage
- No CORS issues (same origin)
- Simpler for a beginner to understand and maintain
- WhiteNoise handles static files efficiently

### Backend Changes
- New app: `accounts` (user auth with SimpleJWT)
- New app: `favorites` (user-recipe relationship)
- New endpoints in `recipes`: filter by ingredient/category/area, list ingredients, list areas
- Security middleware additions (CSP, enhanced headers)
- Serializer layer for all responses

### Frontend Changes
- Filter controls component
- Auth pages (Login, Register)
- Favorites page
- Protected route wrapper
- Auth context/state management
- API client with JWT token handling

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| TheMealDB API downtime | High | Aggressive caching, graceful error UI |
| JWT token storage in browser | Medium | HttpOnly cookies approach or localStorage with XSS protection via CSP |
| SQLite limitations in prod | Low | Documented PostgreSQL migration path |
| Scope creep | Medium | Strict in/out scope boundaries |

## Success Criteria
1. User can search recipes by name
2. User can filter by ingredient, category, and region
3. User can register, login, and logout
4. User can save and view favorite recipes
5. All security headers present in responses
6. App runs as single Django server
7. Mobile-responsive UI
