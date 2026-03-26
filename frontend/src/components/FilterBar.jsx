import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCategories, getIngredients, getAreas } from '../api'
import { translateCategory, translateArea, translateIngredient } from '../translations'

export default function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const activeCategory = searchParams.get('category') || ''
  const activeIngredient = searchParams.get('ingredient') || ''
  const activeArea = searchParams.get('area') || ''

  useEffect(() => {
    Promise.allSettled([getCategories(), getIngredients(), getAreas()])
      .then(([catResult, ingResult, areaResult]) => {
        if (catResult.status === 'fulfilled') {
          setCategories(catResult.value.categories || [])
        }
        if (ingResult.status === 'fulfilled') {
          setIngredients(
            (ingResult.value.ingredients || []).map((i) => i.strIngredient).sort()
          )
        }
        if (areaResult.status === 'fulfilled') {
          setAreas(
            (areaResult.value.areas || []).map((a) => a.strArea).sort()
          )
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
      if (key !== 'category') params.delete('category')
      if (key !== 'ingredient') params.delete('ingredient')
      if (key !== 'area') params.delete('area')
      params.delete('q')
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  const clearAll = () => {
    setSearchParams({})
  }

  const hasFilters = activeCategory || activeIngredient || activeArea

  if (loading) {
    return (
      <div className="flex gap-3 animate-pulse">
        <div className="h-10 w-full sm:w-40 bg-gray-200 rounded-lg" />
        <div className="h-10 w-full sm:w-40 bg-gray-200 rounded-lg hidden sm:block" />
        <div className="h-10 w-full sm:w-40 bg-gray-200 rounded-lg hidden sm:block" />
      </div>
    )
  }

  const selectClass = `w-full sm:w-auto px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm bg-white
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`

  return (
    <div className="space-y-3">
      {/* Botón toggle filtros en mobile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="sm:hidden w-full flex items-center justify-between px-4 py-2.5
                   bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
      >
        <span>🎛️ Filtros {hasFilters && `(${[activeCategory, activeIngredient, activeArea].filter(Boolean).length})`}</span>
        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filtros - siempre visibles en desktop, colapsable en mobile */}
      <div className={`${expanded ? 'block' : 'hidden'} sm:block`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={activeCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
            className={selectClass}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.idCategory} value={cat.strCategory}>
                {translateCategory(cat.strCategory)}
              </option>
            ))}
          </select>

          <select
            value={activeIngredient}
            onChange={(e) => updateFilter('ingredient', e.target.value)}
            className={selectClass}
          >
            <option value="">Todos los ingredientes</option>
            {ingredients.map((ing) => (
              <option key={ing} value={ing}>
                {translateIngredient(ing)}
              </option>
            ))}
          </select>

          <select
            value={activeArea}
            onChange={(e) => updateFilter('area', e.target.value)}
            className={selectClass}
          >
            <option value="">Todas las cocinas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {translateArea(area)}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="w-full sm:w-auto px-3 py-2.5 sm:py-2 text-sm text-red-500 hover:text-red-700
                         border border-red-200 sm:border-0 rounded-lg sm:rounded-none hover:bg-red-50 sm:hover:bg-transparent
                         transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtros activos */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700
                             rounded-full text-xs font-medium">
              {translateCategory(activeCategory)}
              <button onClick={() => updateFilter('category', '')} className="hover:text-primary-900 ml-0.5">×</button>
            </span>
          )}
          {activeIngredient && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700
                             rounded-full text-xs font-medium">
              {translateIngredient(activeIngredient)}
              <button onClick={() => updateFilter('ingredient', '')} className="hover:text-green-900 ml-0.5">×</button>
            </span>
          )}
          {activeArea && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700
                             rounded-full text-xs font-medium">
              {translateArea(activeArea)}
              <button onClick={() => updateFilter('area', '')} className="hover:text-blue-900 ml-0.5">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
