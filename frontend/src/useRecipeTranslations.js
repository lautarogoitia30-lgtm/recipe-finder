import { useState, useEffect } from 'react'
import { translateRecipeName } from './translationService'

// Hook para traducir nombres de recetas en listas
export function useRecipeTranslations(recipes) {
  const [translatedNames, setTranslatedNames] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!recipes || recipes.length === 0) return

    const translateNames = async () => {
      setLoading(true)
      
      const newTranslations = {}
      const promises = recipes.map(async (recipe) => {
        if (recipe.idMeal) {
          const translated = await translateRecipeName(recipe.strMeal || recipe.strMeal)
          newTranslations[recipe.idMeal] = translated
        }
      })

      await Promise.all(promises)
      setTranslatedNames(prev => ({ ...prev, ...newTranslations }))
      setLoading(false)
    }

    translateNames()
  }, [recipes])

  // Función helper para obtener nombre traducido
  const getTranslatedName = (recipe) => {
    if (!recipe) return ''
    const id = recipe.idMeal
    return translatedNames[id] || recipe.strMeal || recipe.strMeal || ''
  }

  return { translatedNames, loading, getTranslatedName }
}
