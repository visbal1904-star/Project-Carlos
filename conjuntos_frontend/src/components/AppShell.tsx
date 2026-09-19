import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '@/lib/auth'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/pagos', label: 'Pagos' },
  { to: '/visitas', label: 'Visitas' },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/reservas', label: 'Reservas' },
  { to: '/comunicados', label: 'Comunicados' },
  { to: '/pqr', label: 'PQR' },
]

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-lg font-semibold">Los Almendros</p>
          <p className="text-sm text-muted-foreground">Conjunto residencial</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground/80 hover:bg-muted'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border pt-4">
          <p className="truncate text-sm font-medium">
            {user?.nombre} {user?.apellido}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.rol}</p>
          <button
            onClick={logout}
            className="mt-3 text-sm font-medium text-danger-fg hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
