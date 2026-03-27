// ==========================================
// Servicio de traducción EN → ES
// Usa MyMemory API (gratuita) + cache local
// ==========================================

const TRANSLATION_CACHE_KEY = 'recipe-translations'
const CACHE_EXPIRY_DAYS = 30

// Obtener cache del localStorage
function getCache() {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY)
    if (!cached) return {}
    const data = JSON.parse(cached)
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
    // Silently fail
  }
}

// Limpiar HTML entities del texto
export function cleanHtmlEntities(text) {
  if (!text) return text
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&#xA0;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Traducir texto usando MyMemory API
async function translateWithAPI(text) {
  if (!text || text.trim().length === 0) return text
  
  // Limpiar HTML entities antes de traducir
  const cleanText = cleanHtmlEntities(text)
  
  // Limitar longitud para evitar problemas con la API (máx ~500 caracteres)
  const textToTranslate = cleanText.length > 500 ? cleanText.substring(0, 500) : cleanText
  
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|es`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      // Si el texto original era más largo, agregar el resto
      if (text.length > 500) {
        return data.responseData.translatedText + text.substring(500)
      }
      return data.responseData.translatedText
    }
    
    console.warn('Translation API response:', data)
    return text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

// Traducir texto (público)
export async function translateText(text, forceRefresh = false) {
  if (!text || text.trim().length === 0) return text
  
  const cacheKey = `text_${text.trim().substring(0, 50).toLowerCase().replace(/\s+/g, '_')}`
  
  if (!forceRefresh) {
    const cache = getCache()
    if (cache[cacheKey]?.es) {
      return cache[cacheKey].es
    }
  }
  
  const translated = await translateWithAPI(text)
  setCache(cacheKey, translated)
  
  return translated
}

// Traducir nombre de receta
export async function translateRecipeName(name) {
  return translateText(name)
}

// Traducir instrucciones
export async function translateInstructions(instructions) {
  if (!instructions) return instructions
  
  const cacheKey = `inst_${instructions.substring(0, 100).toLowerCase().replace(/\s+/g, '_')}`
  const cache = getCache()
  
  if (cache[cacheKey]?.es) {
    return cache[cacheKey].es
  }
  
  const translated = await translateWithAPI(instructions)
  setCache(cacheKey, translated)
  
  return translated
}

// Traducir lista de ingredientes (ingrediente + medida)
export async function translateIngredientList(ingredients) {
  if (!ingredients || ingredients.length === 0) return ingredients
  
  const translated = []
  for (const item of ingredients) {
    // Cache key para ingrediente
    const ingCacheKey = `ing_${item.ingredient.toLowerCase().trim().replace(/\s+/g, '_')}`
    const cache = getCache()
    
    let translatedIng = item.ingredient
    if (cache[ingCacheKey]?.es) {
      translatedIng = cache[ingCacheKey].es
    } else {
      translatedIng = await translateWithAPI(item.ingredient)
      setCache(ingCacheKey, translatedIng)
    }
    
    // Traducir también la medida (si tiene texto en inglés)
    let translatedMeas = item.measure
    if (item.measure && /[a-zA-Z]/.test(item.measure)) {
      const measCacheKey = `meas_${item.measure.toLowerCase().trim().replace(/\s+/g, '_')}`
      if (cache[measCacheKey]?.es) {
        translatedMeas = cache[measCacheKey].es
      } else {
        translatedMeas = await translateWithAPI(item.measure)
        setCache(measCacheKey, translatedMeas)
      }
    }
    
    translated.push({
      ingredient: translatedIng,
      measure: translatedMeas
    })
  }
  
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
