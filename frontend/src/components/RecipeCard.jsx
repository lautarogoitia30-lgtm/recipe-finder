import { Link } from 'react-router-dom'
import { translateCategory } from '../translations'
import FavoriteButton from './FavoriteButton'

export default function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipe/${recipe.idMeal}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md
                 transition-shadow duration-200 border border-gray-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2" onClick={(e) => e.preventDefault()}>
          <FavoriteButton
            recipeId={recipe.idMeal}
            recipeName={recipe.strMeal}
            recipeThumb={recipe.strMealThumb}
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {recipe.strMeal}
        </h3>
        {recipe.strCategory && (
          <span className="inline-block mt-2 text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
            {translateCategory(recipe.strCategory)}
          </span>
        )}
      </div>
    </Link>
  )
}
