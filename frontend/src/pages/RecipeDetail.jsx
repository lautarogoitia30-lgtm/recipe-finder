import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRecipeDetail } from '../api'
import { translateIngredient, translateMeasure, translateCategory, translateArea } from '../translations'
import FavoriteButton from '../components/FavoriteButton'

export default function RecipeDetail() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRecipe = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRecipeDetail(id)
      setRecipe(data.recipe)
    } catch (err) {
      setError(err.message || 'No se pudo cargar la receta')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadRecipe()
  }, [loadRecipe])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-5xl mb-4">😢</p>
        <p className="text-red-500 text-lg mb-4">{error || 'Receta no encontrada'}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={loadRecipe}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                       transition-colors font-medium"
          >
            Reintentar
          </button>
          <Link
            to="/"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50
                       transition-colors font-medium"
          >
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

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-sm text-gray-500 hover:text-primary-600 mb-4 sm:mb-6 inline-block">
        ← Volver al inicio
      </Link>

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{recipe.strMeal}</h1>
          <div className="flex gap-2 flex-wrap">
            {recipe.strCategory && (
              <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
                {translateCategory(recipe.strCategory)}
              </span>
            )}
            {recipe.strArea && (
              <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                {translateArea(recipe.strArea)}
              </span>
            )}
          </div>
        </div>
        <FavoriteButton
          recipeId={recipe.idMeal}
          recipeName={recipe.strMeal}
          recipeThumb={recipe.strMealThumb}
        />
      </div>

      {/* Imagen */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-sm">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-56 sm:h-80 object-cover"
        />
      </div>

      {/* Ingredientes */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ingredientes</h2>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {ingredients.map((item, i) => (
            <div key={i} className="flex justify-between px-4 py-3">
              <span className="text-gray-700">{item.ingredient}</span>
              <span className="text-gray-500 font-medium">{item.measure}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Instrucciones */}
      {recipe.strInstructions && (
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Instrucciones</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
            {recipe.strInstructions.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-gray-700 mb-3 last:mb-0 leading-relaxed text-sm sm:text-base">
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Video */}
      {recipe.strYoutube && (
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Video tutorial</h2>
          <a
            href={recipe.strYoutube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver en YouTube →
          </a>
        </section>
      )}

      {/* Fuente */}
      {recipe.strSource && (
        <section>
          <a
            href={recipe.strSource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Fuente original de la receta
          </a>
        </section>
      )}
    </div>
  )
}
