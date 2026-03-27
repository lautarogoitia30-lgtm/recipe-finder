import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getRandomRecipe } from '../api'
import { translateCategory } from '../translations'
import { translateRecipeName } from '../translationService'
import RecipeCard from '../components/RecipeCard'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState(null)
  const [featuredName, setFeaturedName] = useState('')
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
        const recipe = randResult.value.recipe || null
        setFeatured(recipe)
        // Traducir nombre de receta destacada
        if (recipe?.strMeal) {
          const translated = await translateRecipeName(recipe.strMeal)
          setFeaturedName(translated)
        }
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
    <div className="space-y-10 sm:space-y-14">
      {/* Hero mejorado */}
      <section className="relative text-center py-10 sm:py-16 px-4">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-10 right-1/4 w-24 h-24 bg-secondary-100 rounded-full blur-2xl opacity-50" />
        
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-5">
            Encontrá tu próxima{' '}
            <span className="text-gradient">receta favorita</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Descubrí comidas y postres deliciosos de todo el mundo.
            Buscá por nombre, explorá por categoría o dejate inspirar con una receta random.
          </p>
        </div>
      </section>

      {/* Error con diseño mejorado */}
      {error && !loading && (
        <div className="text-center py-10 bg-white rounded-2xl border border-red-100 shadow-soft max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 mb-5 font-medium">{error}</p>
          <button
            onClick={loadData}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      )}

      {/* Loading con skeleton */}
      {loading && (
        <div className="space-y-8">
          {/* Featured skeleton */}
          <div className="skeleton h-72 rounded-2xl" />
          
          {/* Categories skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Receta destacada */}
      {!loading && !error && featured && (
        <section className="animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Elegida al azar</h2>
          </div>
          
          <Link
            to={`/recipe/${featured.idMeal}`}
            className="group block bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 md:flex"
          >
            <div className="md:w-1/2 relative overflow-hidden">
              <img
                src={featured.strMealThumb}
                alt={featuredName || featured.strMeal}
                className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
            </div>
            
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              {featured.strCategory && (
                <span className="badge-primary w-fit mb-4 shadow-sm">
                  {translateCategory(featured.strCategory)}
                </span>
              )}
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                {featuredName || featured.strMeal}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-5">
                {featured.strInstructions}
              </p>
              <span className="inline-flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                Ver receta completa
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Categorías */}
      {!loading && !error && categories.length > 0 && (
        <section className="animate-fade-up delay-200">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Explorar por categoría</h2>
          </div>
          
          {/* Categorías como pills */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat, index) => (
              <Link
                key={cat.idCategory}
                to={`/search?category=${encodeURIComponent(cat.strCategory)}`}
                className="group flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-soft border border-slate-100 
                           hover:shadow-card-hover hover:-translate-y-1 hover:border-primary-200
                           transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={cat.strCategoryThumb}
                  alt={cat.strCategory}
                  className="w-12 h-12 rounded-full object-cover shadow-inner group-hover:scale-110 transition-transform duration-300"
                />
                <span className="font-medium text-slate-700 group-hover:text-primary-600 transition-colors">
                  {translateCategory(cat.strCategory)}
                </span>
                <svg 
                  className="w-4 h-4 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
