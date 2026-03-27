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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {getTitle()}
        </h1>
        
        {!loading && !error && (
          <p className="text-slate-500">
            <span className="font-semibold text-primary-600">{recipes.length}</span> receta{recipes.length !== 1 ? 's' : ''} encontrada{recipes.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Barra de filtros */}
      <div className="mb-8">
        <FilterBar />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error con diseño mejorado */}
      {error && !loading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-red-100 shadow-soft max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-5">{error}</p>
          <button
            onClick={fetchResults}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && !error && recipes.length === 0 && (query || ingredient || category || area) && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-soft">
          <div className="w-20 h-20 mx-auto mb-5 bg-slate-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-600 text-lg font-medium mb-2">No se encontraron recetas</p>
          <p className="text-slate-400 mb-6">Probá con otra búsqueda o filtro</p>
          <Link to="/" className="btn-primary">
            Explorar recetas
          </Link>
        </div>
      )}

      {/* Grid de resultados */}
      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <div 
              key={recipe.idMeal} 
              className="animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
