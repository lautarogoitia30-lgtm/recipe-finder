# Technical Design: Recipe Finder MVP

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  React SPA (served by Django in prod)           │
│  ┌─────────────────────────────────────────┐    │
│  │  Pages: Home, Search, Detail, Favorites  │    │
│  │  Login, Register                         │    │
│  └────────────────┬────────────────────────┘    │
│                   │ /api/*                       │
└───────────────────┼─────────────────────────────┘
                    │
┌───────────────────┼─────────────────────────────┐
│              Django Server                       │
│  ┌────────────────▼────────────────────────┐    │
│  │  URLs: /api/recipes/*, /api/auth/*,     │    │
│  │        /api/favorites/*                  │    │
│  ├─────────────────────────────────────────┤    │
│  │  Apps: recipes, accounts, favorites      │    │
│  ├─────────────────────────────────────────┤    │
│  │  DRF Views → Serializers → TheMealDB    │    │
│  ├─────────────────────────────────────────┤    │
│  │  Middleware: CSP, CORS, Security, Auth   │    │
│  ├─────────────────────────────────────────┤    │
│  │  Cache: Django cache (LocMem in dev,     │    │
│  │         Redis/file-based in prod)        │    │
│  ├─────────────────────────────────────────┤    │
│  │  Database: SQLite (dev) / PostgreSQL     │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │   TheMealDB API │
           │  (external)     │
           └─────────────────┘
```

## 2. Data Models

### 2.1 User (built-in Django User)
No changes needed — Django's auth.User provides:
- username, email, password (hashed)
- is_active, date_joined
- We'll use email as the login identifier

### 2.2 Favorite Model
```python
# favorites/models.py
from django.db import models
from django.conf import settings

class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    recipe_id = models.CharField(max_length=10)  # TheMealDB ID
    recipe_name = models.CharField(max_length=200)  # Cached for display
    recipe_thumb = models.URLField(blank=True)  # Cached thumbnail
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "recipe_id")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} → {self.recipe_name}"
```

### 2.3 User Serializer
```python
# accounts/serializers.py
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "date_joined"]
        read_only_fields = ["id", "date_joined"]
```

## 3. API Design

### 3.1 Recipes (existing + new endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/recipes/search/?q=name` | No | Search by name |
| GET | `/api/recipes/search/?letter=a` | No | Search by first letter |
| GET | `/api/recipes/<id>/` | No | Recipe detail |
| GET | `/api/recipes/categories/` | No | List categories |
| GET | `/api/recipes/random/` | No | Random recipe |
| GET | `/api/recipes/ingredients/` | No | List ingredients (NEW) |
| GET | `/api/recipes/areas/` | No | List areas (NEW) |
| GET | `/api/recipes/filter/?i=chicken` | No | Filter by ingredient (NEW) |
| GET | `/api/recipes/filter/?c=Seafood` | No | Filter by category (NEW) |
| GET | `/api/recipes/filter/?a=Italian` | No | Filter by area (NEW) |

### 3.2 Authentication (new)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Register (email, password) |
| POST | `/api/auth/login/` | No | Login (email, password) → tokens |
| POST | `/api/auth/refresh/` | Refresh | Refresh access token |
| POST | `/api/auth/logout/` | Access | Blacklist refresh token |
| GET | `/api/auth/me/` | Access | Current user info |

### 3.3 Favorites (new)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/favorites/` | Access | List user's favorites |
| POST | `/api/favorites/` | Access | Add favorite {recipe_id, recipe_name, recipe_thumb} |
| DELETE | `/api/favorites/<recipe_id>/` | Access | Remove favorite |
| GET | `/api/favorites/check/<recipe_id>/` | Access | Check if favorited |

### 3.4 Auth Flow (JWT)
```
Client                          Server
  │                               │
  │──POST /auth/login────────────>│
  │   {email, password}           │
  │                               │──Validate credentials
  │                               │──Generate JWT pair
  │<──{access, refresh}───────────│
  │                               │
  │──GET /api/favorites/─────────>│
  │   Authorization: Bearer <t>   │
  │                               │──Decode & validate token
  │<──{favorites: [...]}──────────│
  │                               │
  │──POST /auth/refresh──────────>│
  │   {refresh: <token>}          │
  │                               │──Validate refresh token
  │<──{access: <new_token>}───────│
```

## 4. Frontend Architecture

### 4.1 Component Hierarchy
```
App
├── Header
│   ├── Logo (Link to /)
│   ├── SearchBar
│   └── AuthNav (Login/Logout/Profile)
├── Routes
│   ├── Home
│   │   ├── HeroSection
│   │   ├── FeaturedRecipe
│   │   └── CategoryGrid
│   ├── SearchResults
│   │   ├── FilterBar
│   │   │   ├── IngredientFilter (dropdown)
│   │   │   ├── CategoryFilter (dropdown)
│   │   │   └── AreaFilter (dropdown)
│   │   └── RecipeGrid
│   │       └── RecipeCard (×n)
│   ├── RecipeDetail
│   │   ├── RecipeImage
│   │   ├── IngredientList
│   │   ├── Instructions
│   │   ├── FavoriteButton
│   │   └── VideoLink
│   ├── Favorites (protected)
│   │   └── RecipeGrid
│   ├── Login
│   └── Register
└── Footer
```

### 4.2 State Management
No Redux/Zustand needed for this scope. Use:
- **React Context** for auth state (user, tokens, isAuthenticated)
- **useState/useReducer** for local component state
- **Custom hooks**: `useAuth()`, `useFavorites()`, `useSearch()`

### 4.3 Auth Context
```jsx
// contexts/AuthContext.jsx
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Login: POST /api/auth/login/, store tokens in httpOnly cookies
  // Logout: POST /api/auth/logout/, clear cookies
  // Check auth: GET /api/auth/me/ on mount
  // Refresh: POST /api/auth/refresh/ when 401 received

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 4.4 Protected Route Component
```jsx
// components/ProtectedRoute.jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} />
  return children
}
```

### 4.5 API Client with Interceptors
```jsx
// api.js - Enhanced with JWT handling
const api = axios.create({ baseURL: '/api' })

// Add access token to requests
api.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const newToken = await refreshAccessToken()
      error.config.headers.Authorization = `Bearer ${newToken}`
      return api(error.config)
    }
    return Promise.reject(error)
  }
)
```

## 5. Security Design

### 5.1 CSP Policy
```python
# settings.py (using django-csp)
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "https://fonts.googleapis.com")
CSP_FONT_SRC = ("'self'", "https://fonts.gstatic.com")
CSP_IMG_SRC = ("'self'", "https://www.themealdb.com", "data:")
CSP_CONNECT_SRC = ("'self'",)
CSP_FRAME_ANCESTORS = ("'none'",)
```

### 5.2 JWT Token Strategy
- **Access token**: Short-lived (15 min), stored in memory (React state)
- **Refresh token**: Longer-lived (7 days), stored in httpOnly cookie
- On page load: try to refresh → if valid, user is authenticated
- On 401: auto-refresh → if refresh fails, redirect to login

### 5.3 Input Validation Chain
```
Request → Django URL routing → DRF Serializer validation
→ Custom validator (sanitize HTML, check length)
→ View logic → TheMealDB API call
```

### 5.4 Security Middleware Stack (Updated)
```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Static files
    "csp.middleware.CSPMiddleware",                 # Content Security Policy
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
```

## 6. Deployment Architecture

### 6.1 Development
```bash
# Terminal 1: Django
cd backend && python manage.py runserver  # Port 8000

# Terminal 2: React (Vite)
cd frontend && npm run dev  # Port 3000, proxies /api to 8000
```

### 6.2 Production (Single Server)
```bash
# Build React
cd frontend && npm run build
# Output → backend/staticfiles/frontend/

# Django serves everything
cd backend
python manage.py collectstatic --noinput
gunicorn recipe_finder.wsgi:application --bind 0.0.0.0:8000
```

### 6.3 URL Routing (Production)
```python
# recipe_finder/urls.py
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("recipes.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/favorites/", include("favorites.urls")),
]

# Serve React SPA for all other routes
from django.views.generic import TemplateView
urlpatterns += [re_path(r"^(?!api/|admin/).*", TemplateView.as_view(template_name="index.html"))]
```

### 6.4 Directory Structure (Final)
```
recipe-finder/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── recipe_finder/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── recipes/          (existing)
│   ├── accounts/         (NEW)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── favorites/        (NEW)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── templates/
│   │   └── index.html    (React build entry)
│   └── staticfiles/      (React build output)
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── RecipeCard.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── FavoriteButton.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── SearchResults.jsx
│   │       ├── RecipeDetail.jsx
│   │       ├── Favorites.jsx
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   └── package.json
├── openspec/
└── .gitignore
```

## 7. Key Sequences (Text Diagrams)

### Search + Filter Flow
```
User types "chicken" → FilterBar: ingredient=chicken
  → Frontend: GET /api/recipes/filter/?i=chicken
  → Backend: cache check → miss
  → Backend: GET themealdb.com/filter.php?i=chicken
  → Backend: cache set (5 min) → return {meals: [...]}
  → Frontend: render RecipeGrid with results
  → User clicks recipe → navigate to /recipe/52772
```

### Login + Save Favorite Flow
```
User submits login → POST /api/auth/login/ {email, password}
  → Backend: validate credentials → generate JWT pair
  → Backend: set refresh token in httpOnly cookie
  → Frontend: store access token in memory, update AuthContext
  → User views recipe → clicks heart icon
  → Frontend: POST /api/favorites/ {recipe_id, recipe_name, recipe_thumb}
  → Backend: create Favorite object → return 201
  → Frontend: heart icon filled, optimistic update
```

### Token Refresh Flow
```
API call returns 401
  → Axios interceptor catches
  → POST /api/auth/refresh/ {refresh: cookie_token}
  → Backend: validate refresh token → generate new access token
  → Frontend: retry original request with new token
  → If refresh fails: clear auth state, redirect to /login
```
