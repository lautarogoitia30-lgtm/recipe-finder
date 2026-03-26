import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchRecipes, filterByIngredient, filterByCategory, filterByArea } from '../api'
import RecipeCard from '../components/RecipeCard'
import FilterBar from '../components/FilterBar'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const ingredient = searchParams.get('ingredient') || ''
  const category = searchParams.get('category') || ''
  const area = searchParams.get('area') || ''

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchResults = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let data
      if (query) {
        data = await searchRecipes(query)
      } else if (ingredient) {
        data = await filterByIngredient(ingredient)
      } else if (category) {
        data = await filterByCategory(category)
      } else if (area) {
        data = await filterByArea(area)
      } else {
        setRecipes([])
        setLoading(false)
        return
      }
      setRecipes(data.meals || [])
    } catch {
      setError('No se pudieron cargar las recetas. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [query, ingredient, category, area])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const getTitle = () => {
    if (query) return `Resultados para "${query}"`
    if (ingredient) return `Recetas con ${ingredient}`
    if (category) return `Recetas de ${category}`
    if (area) return `Cocina ${area}`
    return 'Explorar recetas'
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-500 hover:text-primary-600">
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-bold mt-2">{getTitle()}</h1>
        {!loading && !error && (
          <p className="text-gray-500 mt-1">
            {recipes.length} receta{recipes.length !== 1 ? 's' : ''} encontrada{recipes.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="mb-6">
        <FilterBar />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2" />
          <p className="text-gray-400">Buscando recetas...</p>
        </div>
      )}

      {/* Error con reintentar */}
      {error && !loading && (
        <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                       transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && !error && recipes.length === 0 && (query || ingredient || category || area) && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg">No se encontraron recetas</p>
          <p className="text-gray-400 mt-2">Probá con otra búsqueda o filtro</p>
        </div>
      )}

      {/* Grid de resultados */}
      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.idMeal} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
