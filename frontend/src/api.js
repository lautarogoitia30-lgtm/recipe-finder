// ==========================================
// API Client — Recipe Finder
// Con manejo robusto de errores y timeouts
// ==========================================

const API_BASE = 'https://recipe-finder-32pw.onrender.com/api'
const REQUEST_TIMEOUT = 10000 // 10 segundos

// Token helpers
const getAccessToken = () => sessionStorage.getItem('access_token')
const getRefreshToken = () => sessionStorage.getItem('refresh_token')

// Fetch con timeout automático
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (err) {
    clearTimeout(id)
    if (err.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado. Intentá de nuevo.')
    }
    throw new Error('No se pudo conectar con el servidor. Verificá tu conexión.')
  }
}

// Generic fetch wrapper with auth
async function apiFetch(url, options = {}) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetchWithTimeout(url, { ...options, headers })

  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      headers.Authorization = `Bearer ${getAccessToken()}`
      return fetchWithTimeout(url, { ...options, headers })
    }
  }

  return response
}

// Refresh access token
async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return false

  try {
    const res = await fetchWithTimeout(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) {
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
      return false
    }

    const data = await res.json()
    sessionStorage.setItem('access_token', data.access)
    if (data.refresh) sessionStorage.setItem('refresh_token', data.refresh)
    return true
  } catch {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
    return false
  }
}

// Helper para manejar respuestas de forma segura
async function handleResponse(res) {
  if (!res.ok) {
    try {
      const data = await res.json()
      throw new Error(data.error || 'Error del servidor')
    } catch (e) {
      if (e.message && e.message !== 'Unexpected end of JSON input') throw e
      throw new Error('Error del servidor')
    }
  }

  try {
    const data = await res.json()
    return data
  } catch {
    throw new Error('Respuesta inválida del servidor')
  }
}

// Safe fetch: captura TODOS los errores (red, timeout, parse)
async function safeFetch(url, options = {}) {
  const res = await fetchWithTimeout(url, options)
  return await handleResponse(res)
}

// Verificar si el backend está disponible
export async function checkConnection() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/recipes/health/`, {}, 5000)
    return res.ok
  } catch {
    return false
  }
}

// ==========================================
// Public API calls (no auth needed)
// ==========================================

export async function searchRecipes(query) {
  return safeFetch(`${API_BASE}/recipes/search/?q=${encodeURIComponent(query)}`)
}

export async function filterByIngredient(ingredient) {
  return safeFetch(`${API_BASE}/recipes/filter/?i=${encodeURIComponent(ingredient)}`)
}

export async function filterByCategory(category) {
  return safeFetch(`${API_BASE}/recipes/filter/?c=${encodeURIComponent(category)}`)
}

export async function filterByArea(area) {
  return safeFetch(`${API_BASE}/recipes/filter/?a=${encodeURIComponent(area)}`)
}

export async function getRecipeDetail(id) {
  return safeFetch(`${API_BASE}/recipes/recipes/${id}/`)
}

export async function getCategories() {
  return safeFetch(`${API_BASE}/recipes/categories/`)
}

export async function getIngredients() {
  return safeFetch(`${API_BASE}/recipes/ingredients/`)
}

export async function getAreas() {
  return safeFetch(`${API_BASE}/recipes/areas/`)
}

export async function getRandomRecipe() {
  return safeFetch(`${API_BASE}/recipes/random/`)
}

// ==========================================
// Auth API calls
// ==========================================

export async function apiLogin(email, password) {
  return safeFetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function apiRegister(email, password) {
  return safeFetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

// ==========================================
// Protected API calls (auth required)
// ==========================================

export async function getFavorites() {
  const res = await apiFetch(`${API_BASE}/favorites/`)
  return handleResponse(res)
}

export async function addFavorite(recipeId, recipeName, recipeThumb) {
  const res = await apiFetch(`${API_BASE}/favorites/add/`, {
    method: 'POST',
    body: JSON.stringify({
      recipe_id: recipeId,
      recipe_name: recipeName,
      recipe_thumb: recipeThumb,
    }),
  })
  return handleResponse(res)
}

export async function removeFavorite(recipeId) {
  const res = await apiFetch(`${API_BASE}/favorites/remove/${recipeId}/`, {
    method: 'DELETE',
  })
  return handleResponse(res)
}

export async function checkFavorite(recipeId) {
  const res = await apiFetch(`${API_BASE}/favorites/check/${recipeId}/`)
  return handleResponse(res)
}
