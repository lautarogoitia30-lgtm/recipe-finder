# Task Breakdown: Recipe Finder MVP

## Phase 1: Backend Infrastructure
*Priority: High — Everything else depends on this*

### 1.1 Update requirements.txt
- [ ] Add `djangorestframework-simplejwt` to requirements
- [ ] Add `django-csp` to requirements
- [ ] Add `django-filter` to requirements (optional, for DRF filtering)
- [ ] Verify all versions are compatible

### 1.2 Update Django Settings
- [ ] Add `accounts` and `favorites` to INSTALLED_APPS
- [ ] Add `csp` middleware after SecurityMiddleware
- [ ] Add WhiteNoise middleware for static files
- [ ] Configure SimpleJWT settings (token lifetimes, rotation)
- [ ] Add CSP configuration (default-src, script-src, style-src, img-src)
- [ ] Add security headers for ALL environments (not just prod)
- [ ] Configure REST_FRAMEWORK default authentication classes
- [ ] Update STATICFILES_DIRS to include React build output

### 1.3 Create `accounts` Django App
- [ ] `manage.py startapp accounts`
- [ ] Create UserSerializer (id, email, date_joined)
- [ ] Create RegisterView (POST: validate, create user, return tokens)
- [ ] Create LoginView (POST: validate credentials, return tokens)
- [ ] Create RefreshView (POST: refresh access token)
- [ ] Create LogoutView (POST: blacklist refresh token)
- [ ] Create MeView (GET: return current user info)
- [ ] Create accounts/urls.py with all auth endpoints

### 1.4 Create `favorites` Django App
- [ ] `manage.py startapp favorites`
- [ ] Create Favorite model (user FK, recipe_id, recipe_name, recipe_thumb, created_at)
- [ ] Create FavoriteSerializer
- [ ] Create FavoriteViewSet (list, create, delete, check)
- [ ] Create favorites/urls.py
- [ ] Run `makemigrations` and `migrate`

### 1.5 Enhance `recipes` App
- [ ] Add `list_ingredients` view → calls TheMealDB `list.php?i=list`
- [ ] Add `list_areas` view → calls TheMealDB `list.php?a=list`
- [ ] Add `filter_recipes` view → calls TheMealDB `filter.php` with i/c/a params
- [ ] Add input sanitization helper (strip HTML, limit length)
- [ ] Update recipes/urls.py with new endpoints
- [ ] Add cache keys for new endpoints

### 1.6 Update URL Configuration
- [ ] Update recipe_finder/urls.py to include accounts and favorites
- [ ] Add catch-all route for React SPA (production)
- [ ] Verify all API routes work under `/api/` prefix

---

## Phase 2: Frontend Auth
*Priority: High — Needed before favorites*

### 2.1 Auth Context & API Client
- [ ] Install `axios` (if not already using fetch)
- [ ] Create `src/contexts/AuthContext.jsx` with:
  - user state, loading state
  - login(), logout(), register() functions
  - auto-refresh on 401 interceptor
  - checkAuth() on mount
- [ ] Update `src/api.js` to use axios with interceptors
- [ ] Wrap App in AuthProvider

### 2.2 Login Page
- [ ] Create `src/pages/Login.jsx`
- [ ] Form with email + password fields
- [ ] Form validation (required, email format)
- [ ] Submit → call auth context login()
- [ ] Redirect to intended page after login
- [ ] Link to register page
- [ ] Error display for invalid credentials

### 2.3 Register Page
- [ ] Create `src/pages/Register.jsx`
- [ ] Form with email + password + confirm password
- [ ] Password validation (min 8 chars, match confirmation)
- [ ] Submit → call auth context register()
- [ ] Auto-login after registration
- [ ] Link to login page
- [ ] Error display for duplicate email

### 2.4 Protected Route Component
- [ ] Create `src/components/ProtectedRoute.jsx`
- [ ] Check auth state, redirect to /login if not authenticated
- [ ] Preserve intended destination in location state
- [ ] Show loading spinner while checking auth

### 2.5 Update Header
- [ ] Add auth navigation (Login/Register when guest, Logout when authenticated)
- [ ] Show user email or avatar when logged in
- [ ] Add link to Favorites page (only when authenticated)

---

## Phase 3: Frontend Filters
*Priority: High — Core feature*

### 3.1 Filter Bar Component
- [ ] Create `src/components/FilterBar.jsx`
- [ ] Ingredient dropdown (fetch from `/api/recipes/ingredients/`)
- [ ] Category dropdown (reuse existing categories endpoint)
- [ ] Area/Region dropdown (fetch from `/api/recipes/areas/`)
- [ ] Search input (existing)
- [ ] Active filter chips with remove button
- [ ] Clear all filters button

### 3.2 Update SearchResults Page
- [ ] Integrate FilterBar component
- [ ] Handle filter state changes (URL params)
- [ ] Call appropriate endpoint based on active filter
- [ ] Support combined filters (primary API + client-side intersection)
- [ ] Update URL to reflect active filters (shareable links)
- [ ] Loading state during filter changes

### 3.3 Update API Layer
- [ ] Add `filterByIngredient(ingredient)` function
- [ ] Add `filterByCategory(category)` function
- [ ] Add `filterByArea(area)` function
- [ ] Add `getIngredients()` function
- [ ] Add `getAreas()` function

---

## Phase 4: Favorites Feature
*Priority: Medium — Depends on Auth*

### 4.1 Favorite Button Component
- [ ] Create `src/components/FavoriteButton.jsx`
- [ ] Heart icon (filled when favorited, outline when not)
- [ ] Check favorite status on mount (if authenticated)
- [ ] Toggle on click with optimistic UI update
- [ ] Redirect to login if guest clicks
- [ ] Animated transition on toggle

### 4.2 Favorites API Functions
- [ ] Add `getFavorites()` function
- [ ] Add `addFavorite(recipeId, name, thumb)` function
- [ ] Add `removeFavorite(recipeId)` function
- [ ] Add `checkFavorite(recipeId)` function

### 4.3 Favorites Page
- [ ] Create `src/pages/Favorites.jsx` (protected route)
- [ ] Fetch and display user's favorites
- [ ] Recipe grid with remove functionality
- [ ] Empty state: "No favorites yet. Start exploring!"
- [ ] Loading and error states

### 4.4 Integrate FavoriteButton
- [ ] Add FavoriteButton to RecipeCard component
- [ ] Add FavoriteButton to RecipeDetail page
- [ ] Sync favorite state across components

---

## Phase 5: Security Hardening
*Priority: Medium — Reasonable level*

### 5.1 Content Security Policy
- [ ] Configure django-csp with strict policy
- [ ] Test CSP doesn't break React app
- [ ] Add nonce support for any inline scripts if needed
- [ ] Verify CSP header in browser dev tools

### 5.2 Input Sanitization
- [ ] Create sanitization utility function
- [ ] Apply to all search query parameters
- [ ] Apply to registration inputs
- [ ] Validate recipe_id is numeric (already done)
- [ ] Add max length limits to all text inputs

### 5.3 Error Response Safety
- [ ] Create custom exception handler for DRF
- [ ] Strip internal details from error responses
- [ ] Log full errors server-side only
- [ ] Return generic messages for 500 errors

### 5.4 Security Headers Audit
- [ ] Verify all headers present in responses:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy
  - Permissions-Policy
  - CSP
- [ ] Test with securityheaders.com

---

## Phase 6: Single-Server Deployment
*Priority: Medium — Needed for production*

### 6.1 Static File Serving
- [ ] Add WhiteNoise to requirements and middleware
- [ ] Configure STATICFILES_DIRS for React build
- [ ] Set up build output path
- [ ] Test static file serving in production mode

### 6.2 React Build Integration
- [ ] Create build script that:
  1. Builds React app
  2. Copies output to Django static directory
  3. Runs collectstatic
- [ ] Update Vite config for production base path
- [ ] Configure Django to serve index.html for SPA routes

### 6.3 Production Settings
- [ ] Create `settings_prod.py` or use env vars for:
  - DEBUG=False
  - SECRET_KEY from env
  - Database (PostgreSQL)
  - ALLOWED_HOSTS
  - Static files config
- [ ] Create `.env.example` with all required vars

---

## Phase 7: Frontend Polish
*Priority: Low — After core features work*

### 7.1 Loading States
- [ ] Add skeleton loaders for recipe cards
- [ ] Add spinner for page transitions
- [ ] Disable buttons during API calls
- [ ] Shimmer effect on skeletons

### 7.2 Error Handling
- [ ] Create ErrorBoundary component
- [ ] Add toast/notification system for errors
- [ ] Retry button for network errors
- [ ] Graceful degradation for TheMealDB downtime

### 7.3 Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1024px+)
- [ ] Adjust grid columns per breakpoint
- [ ] Mobile-friendly filter UI (collapsible sidebar or bottom sheet)

### 7.4 Accessibility
- [ ] Add aria-labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus visible styles
- [ ] Test with screen reader
- [ ] Color contrast check

---

## Execution Order

```
Phase 1 (Backend) → can partially parallel with Phase 2
Phase 2 (Auth Frontend) → after 1.3, 1.4 done
Phase 3 (Filters Frontend) → after 1.5 done
Phase 4 (Favorites) → after Phase 2 done
Phase 5 (Security) → can start anytime, finalize last
Phase 6 (Deployment) → after all features work
Phase 7 (Polish) → after Phase 6
```

**Recommended batch order for implementation:**
1. Batch 1: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 (all backend)
2. Batch 2: 2.1 → 2.2 → 2.3 → 2.4 → 2.5 (auth frontend)
3. Batch 3: 3.1 → 3.2 → 3.3 (filters frontend)
4. Batch 4: 4.1 → 4.2 → 4.3 → 4.4 (favorites)
5. Batch 5: 5.1 → 5.2 → 5.3 → 5.4 (security)
6. Batch 6: 6.1 → 6.2 → 6.3 (deployment)
7. Batch 7: 7.1 → 7.2 → 7.3 → 7.4 (polish)
