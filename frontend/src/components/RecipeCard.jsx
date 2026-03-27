import { Link } from 'react-router-dom'
import { translateCategory } from '../translations'
import FavoriteButton from './FavoriteButton'

export default function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipe/${recipe.idMeal}`}
      className="group card-hover block animate-fade-up"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Imagen con overlay en hover */}
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Botón favorito */}
        <div 
          className="absolute top-3 right-3 transform opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          onClick={(e) => e.preventDefault()}
        >
          <FavoriteButton
            recipeId={recipe.idMeal}
            recipeName={recipe.strMeal}
            recipeThumb={recipe.strMealThumb}
          />
        </div>

        {/* Badge de categoría en móvil */}
        {recipe.strCategory && (
          <div className="absolute bottom-3 left-3 sm:hidden">
            <span className="badge-primary backdrop-blur-sm">
              {translateCategory(recipe.strCategory)}
            </span>
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight mb-2">
          {recipe.strMeal}
        </h3>
        
        <div className="flex items-center justify-between">
          {recipe.strCategory && (
            <span className="hidden sm:inline-flex badge-primary">
              {translateCategory(recipe.strCategory)}
            </span>
          )}
          {recipe.strArea && (
            <span className="badge-slate ml-auto">
              {recipe.strArea}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
