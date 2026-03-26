import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Fila principal */}
        <div className="flex items-center justify-between gap-3 py-3">
          <Link to="/" className="text-lg font-bold text-primary-600 shrink-0">
            🍳 Recetas
          </Link>

          {/* Buscador - visible en desktop, inline en mobile */}
          <form onSubmit={handleSubmit} className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar recetas..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           text-sm"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Nav desktop */}
          <nav className="hidden sm:flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <Link to="/favorites" className="text-sm text-gray-600 hover:text-primary-600">
                  ❤️ Favoritos
                </Link>
                <span className="text-xs text-gray-400">{user.email}</span>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="text-sm px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Registrarse
                </Link>
              </>
            )}
          </nav>

          {/* Botón menú mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Buscador mobile - debajo del header */}
        <form onSubmit={handleSubmit} className="sm:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar recetas..."
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         text-base"
            />
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Menú mobile desplegable */}
        {menuOpen && (
          <nav className="sm:hidden pb-4 border-t border-gray-100 pt-3 space-y-2">
            {user ? (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  ❤️ Mis favoritos
                </Link>
                <span className="block px-3 py-1 text-xs text-gray-400">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
