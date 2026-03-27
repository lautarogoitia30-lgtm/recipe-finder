import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRecipeDetail } from '../api'
import { translateIngredient, translateMeasure, translateCategory, translateArea } from '../translations'
import { translateRecipeName, translateInstructions } from '../translationService'
import FavoriteButton from '../components/FavoriteButton'

export default function RecipeDetail() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [translating, setTranslating] = useState(false)
  const [translatedName, setTranslatedName] = useState('')
  const [translatedInstructions, setTranslatedInstructions] = useState('')
  const [showTranslation, setShowTranslation] = useState(true)

  const loadRecipe = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTranslating(true)
    try {
      const data = await getRecipeDetail(id)
      setRecipe(data.recipe)
      
      // Traducir nombre e instrucciones
      if (data.recipe) {
        const [name, instructions] = await Promise.all([
          translateRecipeName(data.recipe.strMeal),
          translateInstructions(data.recipe.strInstructions)
        ])
        setTranslatedName(name)
        setTranslatedInstructions(instructions)
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar la receta')
    } finally {
      setLoading(false)
      setTranslating(false)
    }
  }, [id])

  useEffect(() => {
    loadRecipe()
  }, [loadRecipe])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="skeleton h-8 w-32 rounded-lg mb-6" />
        <div className="skeleton h-80 rounded-2xl mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 text-lg mb-2">{error || 'Receta no encontrada'}</p>
        <p className="text-slate-400 mb-6">Parece que algo salió mal</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={loadRecipe}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
          <Link to="/" className="btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  // Extraer ingredientes + medidas (traducidos)
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]
    const measure = recipe[`strMeasure${i}`]
    if (ingredient?.trim()) {
      ingredients.push({
        ingredient: translateIngredient(ingredient.trim()),
        measure: translateMeasure(measure?.trim() || ''),
      })
    }
  }

  // Usar traducción o original
  const displayName = showTranslation && translatedName ? translatedName : recipe.strMeal
  const displayInstructions = showTranslation && translatedInstructions ? translatedInstructions : recipe.strInstructions

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      {/* Back button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 sm:mb-8 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio
      </Link>

      {/* Traduciendo... */}
      {translating && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-xl flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-primary-700 text-sm font-medium">Traduciendo receta...</span>
        </div>
      )}

      {/* Toggle traducción */}
      {translatedName && translatedInstructions && (
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showTranslation 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {showTranslation ? 'Ver en inglés' : 'Ver en español'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {displayName}
          </h1>
          <div className="flex flex-wrap gap-2">
            {recipe.strCategory && (
              <span className="badge-primary shadow-sm">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                {translateCategory(recipe.strCategory)}
              </span>
            )}
            {recipe.strArea && (
              <span className="badge bg-blue-50 text-blue-700 shadow-sm">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {translateArea(recipe.strArea)}
              </span>
            )}
          </div>
        </div>
        <div onClick={(e) => e.preventDefault()}>
          <FavoriteButton
            recipeId={recipe.idMeal}
            recipeName={showTranslation && translatedName ? translatedName : recipe.strMeal}
            recipeThumb={recipe.strMealThumb}
          />
        </div>
      </div>

      {/* Imagen con shadow */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-8 shadow-card-hover">
        <img
          src={recipe.strMealThumb}
          alt={displayName}
          className="w-full h-56 sm:h-80 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Ingredientes */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Ingredientes</h2>
          <span className="text-slate-400 text-sm ml-auto">{ingredients.length} items</span>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="divide-y divide-slate-50">
            {ingredients.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-slate-700 font-medium">{item.ingredient}</span>
                </div>
                <span className="text-slate-500 font-medium">{item.measure}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instrucciones */}
      {displayInstructions && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Instrucciones</h2>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 sm:p-7">
            {displayInstructions.split('\n').filter(Boolean).map((para, i) => (
              <div key={i} className="flex gap-4 mb-4 last:mb-0">
                <div className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                  {para}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video y Fuente */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
        {recipe.strYoutube && (
          <a
            href={recipe.strYoutube}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Ver video en YouTube
          </a>
        )}
        {recipe.strSource && (
          <a
            href={recipe.strSource}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Fuente original
          </a>
        )}
      </div>
    </div>
  )
}
