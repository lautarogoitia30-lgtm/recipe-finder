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
          <div key={i} className="skeleton h-72 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-red-100 shadow-soft">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={loadFavorites} className="btn-primary mt-4">
          Reintentar
        </button>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        {/* Elementos decorativos */}
        <div className="absolute top-40 left-10 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-secondary-100 rounded-full blur-3xl opacity-50" />
        
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
           Todavía no tenés favoritos
          </h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            ¡Explorá y guardá las recetas que más te gusten para accederlas rápido!
          </p>
          
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar recetas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tus favoritos</h1>
        </div>
        <p className="text-slate-500 pl-13">
          <span className="font-semibold text-primary-600">{favorites.length}</span> receta{favorites.length !== 1 ? 's' : ''} guardada{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav, index) => (
          <div 
            key={fav.recipe_id} 
            className="relative group animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <RecipeCard
              recipe={{
                idMeal: fav.recipe_id,
                strMeal: fav.recipe_name,
                strMealThumb: fav.recipe_thumb,
              }}
            />
            <button
              onClick={() => handleRemove(fav.recipe_id)}
              className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md
                         hover:bg-red-50 hover:scale-110 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
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
