import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getRandomRecipe } from '../api'
import { translateCategory } from '../translations'
import RecipeCard from '../components/RecipeCard'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [catResult, randResult] = await Promise.allSettled([
        getCategories(),
        getRandomRecipe(),
      ])

      if (catResult.status === 'fulfilled') {
        setCategories(catResult.value.categories?.slice(0, 8) || [])
      }
      if (randResult.status === 'fulfilled') {
        setFeatured(randResult.value.recipe || null)
      }

      // Solo mostrar error si AMBAS fallaron
      if (catResult.status === 'rejected' && randResult.status === 'rejected') {
        setError('No se pudieron cargar las recetas. Verificá tu conexión.')
      }
    } catch (err) {
      setError('No se pudieron cargar las recetas. Verificá tu conexión.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero */}
      <section className="text-center py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Encontrá tu próxima <span className="text-primary-600">receta favorita</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto px-2">
          Descubrí comidas y postres deliciosos de todo el mundo.
          Buscá por nombre, explorá por categoría o dejate inspirar con una receta random.
        </p>
      </section>

      {/* Error con botón reintentar */}
      {error && !loading && (
        <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                       transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2" />
          <p className="text-gray-400">Cargando recetas...</p>
        </div>
      )}

      {/* Receta destacada */}
      {!loading && !error && featured && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Elegida al azar</h2>
          <Link
            to={`/recipe/${featured.idMeal}`}
            className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md
                       transition-shadow border border-gray-100 md:flex"
          >
            <div className="md:w-1/2">
              <img
                src={featured.strMealThumb}
                alt={featured.strMeal}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-full w-fit mb-3">
                {translateCategory(featured.strCategory)}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{featured.strMeal}</h3>
              <p className="text-gray-500 text-sm line-clamp-3">
                {featured.strInstructions}
              </p>
              <span className="mt-4 text-primary-600 font-medium text-sm">
                Ver receta completa →
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Categorías */}
      {!loading && !error && categories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Explorar por categoría</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.idCategory}
                to={`/search?category=${encodeURIComponent(cat.strCategory)}`}
                className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md
                           transition-shadow border border-gray-100"
              >
                <img
                  src={cat.strCategoryThumb}
                  alt={cat.strCategory}
                  className="w-16 h-16 mx-auto mb-2 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                  {translateCategory(cat.strCategory)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
