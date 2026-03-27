// ==========================================
// Servicio de traducción EN → ES
// Usa MyMemory API (gratuita) + cache local
// ==========================================

const TRANSLATION_CACHE_KEY = 'recipe-translations'
const CACHE_EXPIRY_DAYS = 30 // Las traducciones duran 30 días

// Obtener cache del localStorage
function getCache() {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY)
    if (!cached) return {}
    const data = JSON.parse(cached)
    // Limpiar entradas expiradas
    const now = Date.now()
    const cleaned = {}
    for (const [key, value] of Object.entries(data)) {
      if (value.timestamp && now - value.timestamp < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
        cleaned[key] = value
      }
    }
    return cleaned
  } catch {
    return {}
  }
}

// Guardar en cache
function setCache(key, translation) {
  try {
    const cache = getCache()
    cache[key] = {
      es: translation,
      timestamp: Date.now()
    }
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Silently fail si localStorage está lleno
  }
}

// Traducir texto usando MyMemory API
async function translateWithAPI(text) {
  // MyMemory API - gratuita, 1000 palabras/día sin API key
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
    
    // Si la API falla, devolver texto original
    console.warn('Translation API failed:', data)
    return text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

// Traducir con cache - función principal
export async function translateText(text, forceRefresh = false) {
  if (!text || text.trim().length === 0) return text
  
  // Generar clave única para el cache
  const cacheKey = `text_${text.trim().substring(0, 50).toLowerCase().replace(/\s+/g, '_')}`
  
  // Verificar cache primero
  if (!forceRefresh) {
    const cache = getCache()
    if (cache[cacheKey]?.es) {
      return cache[cacheKey].es
    }
  }
  
  // Traducir con API
  const translated = await translateWithAPI(text)
  
  // Guardar en cache
  setCache(cacheKey, translated)
  
  return translated
}

// Traducir nombre de receta
export async function translateRecipeName(name) {
  return translateText(name)
}

// Traducir instrucciones (largas, las dividimos en chunks)
export async function translateInstructions(instructions) {
  if (!instructions) return instructions
  
  // Verificar cache primero para instrucciones completas
  const cacheKey = `instructions_${instructions.substring(0, 100).toLowerCase().replace(/\s+/g, '_')}`
  const cache = getCache()
  if (cache[cacheKey]?.es) {
    return cache[cacheKey].es
  }
  
  // Las instrucciones pueden ser muy largas, las traducimos directamente
  const translated = await translateWithAPI(instructions)
  
  // Guardar en cache
  setCache(cacheKey, translated)
  
  return translated
}

// Limpiar cache de traducciones
export function clearTranslationCache() {
  localStorage.removeItem(TRANSLATION_CACHE_KEY)
}

// Obtener estadísticas del cache
export function getCacheStats() {
  const cache = getCache()
  return {
    entries: Object.keys(cache).length,
    oldest: cache[Object.keys(cache)[0]]?.timestamp || null,
    newest: cache[Object.keys(cache)[Object.keys(cache).length - 1]]?.timestamp || null
  }
}
