import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Paquete } from '@/lib/types'

export function PaquetesPage() {
  const { user } = useAuth()
  const esPortero = user?.rol === 'Portero' || user?.rol === 'Administrador'

  const [paquetes, setPaquetes] = useState<Paquete[]>([])

  async function load() {
    const { data } = await api.get<Paquete[]>('/paquetes')
    setPaquetes(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function entregar(id: number) {
    try {
      await api.patch(`/paquetes/${id}/entregar`)
      toast.success('Paquete marcado como entregado')
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Paquetes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Encomiendas recibidas en portería</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transportadora</TableHead>
              <TableHead>Guía</TableHead>
              <TableHead>Recepción</TableHead>
              <TableHead>Estado</TableHead>
              {esPortero && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paquetes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay paquetes registrados.
                </TableCell>
              </TableRow>
            )}
            {paquetes.map((p) => (
              <TableRow key={p.id_paquete}>
                <TableCell>{p.empresa_transportadora}</TableCell>
                <TableCell>{p.numero_guia ?? '—'}</TableCell>
                <TableCell>{p.fecha_hora_recepcion}</TableCell>
                <TableCell>
                  <StatusBadge estado={p.estado} />
                </TableCell>
                {esPortero && (
                  <TableCell className="text-right">
                    {p.estado === 'recibido' && (
                      <Button size="sm" variant="outline" onClick={() => entregar(p.id_paquete)}>
                        Marcar entregado
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
