import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { checkFavorite, addFavorite, removeFavorite } from '../api'

export default function FavoriteButton({ recipeId, recipeName, recipeThumb }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && recipeId) {
      checkFavorite(recipeId)
        .then((data) => setIsFavorited(data.is_favorited))
        .catch(() => {})
    }
  }, [user, recipeId])

  const handleToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      navigate('/login', { state: { from: { pathname: `/recipe/${recipeId}` } } })
      return
    }

    setLoading(true)
    try {
      if (isFavorited) {
        await removeFavorite(recipeId)
        setIsFavorited(false)
      } else {
        await addFavorite(recipeId, recipeName, recipeThumb)
        setIsFavorited(true)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isFavorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-400'
      } disabled:opacity-50`}
      title={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <svg
        className="w-5 h-5 transition-transform duration-200"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
