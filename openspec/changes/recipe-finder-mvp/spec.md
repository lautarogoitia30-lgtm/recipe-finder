# Specifications: Recipe Finder MVP

## 1. Enhanced Search & Filtering

### 1.1 Search by Name
**Given** a user is on the search page
**When** they type a recipe name and submit
**Then** the system returns matching recipes from TheMealDB with name, category, thumbnail, and ID

### 1.2 Filter by Ingredient
**Given** a user selects an ingredient filter
**When** the system receives the filter request
**Then** it calls TheMealDB `filter.php?i={ingredient}` and returns matching recipes
**And** each result includes meal name, thumbnail, and ID

### 1.3 Filter by Category
**Given** a user selects a category (e.g., "Seafood", "Dessert")
**When** the system receives the filter request
**Then** it calls TheMealDB `filter.php?c={category}` and returns matching recipes

### 1.4 Filter by Region/Cuisine
**Given** a user selects a region (e.g., "Italian", "Mexican")
**When** the system receives the filter request
**Then** it calls TheMealDB `filter.php?a={area}` and returns matching recipes

### 1.5 Autocomplete Lists
**Given** a user opens a filter dropdown
**When** the component mounts
**Then** the system fetches the list of available ingredients/areas from TheMealDB
**And** displays them in a searchable dropdown

### 1.6 Combined Filters
**Given** a user applies multiple filters (e.g., ingredient + category)
**When** the system receives the request
**Then** it applies the primary filter and client-side filters the results
**Note**: TheMealDB free API doesn't support multi-filter; we do client-side intersection

### 1.7 Edge Cases
- Empty search → return error 400 with message
- No results → return empty array, frontend shows "No recipes found"
- TheMealDB down → return 503 with user-friendly message
- Special characters in search → sanitize before API call
- Very long query (>100 chars) → truncate and warn

---

## 2. User Authentication

### 2.1 Registration
**Given** a new user provides email and password
**When** they submit the registration form
**Then** the system creates a new user account
**And** returns JWT access + refresh tokens
**And** password is validated (min 8 chars, not too common, not all numeric)

### 2.2 Login
**Given** a registered user provides credentials
**When** they submit the login form
**Then** the system validates credentials
**And** returns JWT access token (15 min) + refresh token (7 days)

### 2.3 Token Refresh
**Given** a user has a valid refresh token
**When** their access token expires
**Then** the system issues a new access token using the refresh token

### 2.4 Logout
**Given** a logged-in user clicks logout
**When** the logout request is sent
**Then** the system blacklists the refresh token
**And** the frontend clears stored tokens

### 2.5 Edge Cases
- Duplicate email → 400 "Email already registered"
- Invalid credentials → 401 "Invalid email or password"
- Expired refresh token → 401 "Token expired, please login again"
- Malformed token → 401 "Invalid token"

---

## 3. Favorites System

### 3.1 Save Favorite
**Given** an authenticated user views a recipe
**When** they click "Add to Favorites"
**Then** the system saves the recipe ID to their favorites list
**And** the heart/bookmark icon changes to filled state

### 3.2 List Favorites
**Given** an authenticated user navigates to Favorites page
**When** the page loads
**Then** the system returns all saved recipe IDs
**And** fetches recipe details from TheMealDB for each
**And** displays them in the standard recipe card grid

### 3.3 Remove Favorite
**Given** an authenticated user has saved favorites
**When** they click "Remove from Favorites"
**Then** the system removes the recipe from their list
**And** the UI updates immediately (optimistic update)

### 3.4 Check Favorite Status
**Given** an authenticated user views any recipe
**When** the recipe detail loads
**Then** the system checks if the recipe is in their favorites
**And** displays the appropriate heart state (filled/outline)

### 3.5 Edge Cases
- Guest user clicks favorite → redirect to login with return URL
- Recipe already favorited → toggle removes it
- TheMealDB recipe deleted → show "Recipe no longer available" in favorites

---

## 4. Security Requirements

### 4.1 Content Security Policy
**Given** any page loads
**Then** the response includes a CSP header that:
- Allows scripts only from same origin
- Allows styles from same origin + Google Fonts
- Allows images from same origin + TheMealDB domain
- Blocks inline scripts (except nonce-based)
- Blocks eval()

### 4.2 Input Sanitization
**Given** any API endpoint receives input
**Then** the system strips HTML tags from string inputs
**And** validates numeric inputs are actually numbers
**And** limits string length to reasonable maximums
**And** rejects requests with suspicious patterns

### 4.3 Error Response Safety
**Given** an error occurs
**Then** the response NEVER includes:
- Stack traces
- Django version info
- File paths on server
- Database query details
- Internal variable names

### 4.4 Security Headers (All Environments)
Every response includes:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### 4.5 JWT Token Security
- Access token: 15 minutes lifetime
- Refresh token: 7 days lifetime, blacklisted on logout
- Tokens stored in httpOnly cookies (NOT localStorage)
- SameSite=Strict for auth cookies

---

## 5. Single-Server Deployment

### 5.1 Development Mode
**Given** a developer runs the project
**When** they start Django (`manage.py runserver`) AND Vite (`npm run dev`)
**Then** Vite proxies `/api` requests to Django
**And** hot reload works for frontend changes

### 5.2 Production Mode
**Given** the React app is built (`npm run build`)
**When** Django starts in production mode
**Then** Django serves the React build from a configured directory
**And** all `/api/*` routes go to DRF
**And** all other routes serve `index.html` (SPA routing)
**And** static files are served via WhiteNoise

### 5.3 Build Integration
**Given** a production deployment
**When** the build process runs
**Then** `npm run build` outputs to `backend/staticfiles/frontend/`
**And** Django's STATICFILES_DIRS includes this directory
**And** `collectstatic` gathers everything

---

## 6. Frontend Requirements

### 6.1 Responsive Design
- Mobile: single column, hamburger menu if needed
- Tablet: 2-column grid
- Desktop: 3-column grid
- Breakpoints: 640px (sm), 768px (md), 1024px (lg)

### 6.2 Loading States
- Skeleton loaders for recipe cards
- Spinner for page transitions
- Disabled buttons during API calls

### 6.3 Error Handling
- Network error: "Connection lost. Please try again."
- 404: "Recipe not found" with link back home
- 503: "Service temporarily unavailable" with retry button
- Auth error: Redirect to login

### 6.4 Accessibility
- All images have alt text
- Keyboard navigation works
- Focus states visible
- Color contrast ratio ≥ 4.5:1
- Screen reader friendly labels
