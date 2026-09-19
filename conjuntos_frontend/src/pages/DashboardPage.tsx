import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Comunicado, Pago, PQR } from '@/lib/types'

export function DashboardPage() {
  const { user } = useAuth()
  const [pagosPendientes, setPagosPendientes] = useState(0)
  const [pqrAbiertas, setPqrAbiertas] = useState(0)
  const [ultimoComunicado, setUltimoComunicado] = useState<Comunicado | null>(null)

  useEffect(() => {
    api.get<Pago[]>('/pagos').then(({ data }) => {
      setPagosPendientes(data.filter((p) => p.estado === 'pendiente').length)
    })
    api.get<PQR[]>('/pqr').then(({ data }) => {
      setPqrAbiertas(data.filter((p) => p.estado !== 'cerrado').length)
    })
    api.get<Comunicado[]>('/comunicados').then(({ data }) => {
      setUltimoComunicado(data[0] ?? null)
    })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold">Hola, {user?.nombre}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Este es el resumen de tu conjunto residencial</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/pagos" className="rounded-xl border border-border bg-card p-5 hover:border-accent">
          <p className="text-sm text-muted-foreground">Pagos pendientes</p>
          <p className="mt-2 text-3xl font-semibold">{pagosPendientes}</p>
        </Link>
        <Link to="/pqr" className="rounded-xl border border-border bg-card p-5 hover:border-accent">
          <p className="text-sm text-muted-foreground">PQR sin cerrar</p>
          <p className="mt-2 text-3xl font-semibold">{pqrAbiertas}</p>
        </Link>
        <Link to="/comunicados" className="rounded-xl border border-border bg-card p-5 hover:border-accent">
          <p className="text-sm text-muted-foreground">Último comunicado</p>
          <p className="mt-2 line-clamp-2 font-medium">{ultimoComunicado?.titulo ?? 'Sin comunicados aún'}</p>
        </Link>
      </div>
    </div>
  )
}
