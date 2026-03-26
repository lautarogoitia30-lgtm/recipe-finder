import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFavorites, removeFavorite } from '../api'
import RecipeCard from '../components/RecipeCard'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const data = await getFavorites()
      setFavorites(data.favorites || [])
    } catch {
      setError('No se pudieron cargar los favoritos')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (recipeId) => {
    try {
      await removeFavorite(recipeId)
      setFavorites((prev) => prev.filter((f) => f.recipe_id !== recipeId))
    } catch {
      // Silently fail, user can try again
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">💔</p>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Todavía no tenés favoritos</h2>
        <p className="text-gray-500 mb-6">¡Explorá y guardá las recetas que más te gusten!</p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg
                     hover:bg-primary-700 transition-colors"
        >
          Explorar recetas
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tus favoritos</h1>
        <p className="text-gray-500 mt-1">
          {favorites.length} receta{favorites.length !== 1 ? 's' : ''} guardada{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav) => (
          <div key={fav.recipe_id} className="relative group">
            <RecipeCard
              recipe={{
                idMeal: fav.recipe_id,
                strMeal: fav.recipe_name,
                strMealThumb: fav.recipe_thumb,
              }}
            />
            <button
              onClick={() => handleRemove(fav.recipe_id)}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm
                         hover:bg-red-50 transition-colors z-10"
              title="Quitar de favoritos"
            >
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
