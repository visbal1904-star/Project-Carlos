import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, apiErrorMessage } from '@/lib/api'
import type { Pago } from '@/lib/types'

export function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await api.get<Pago[]>('/pagos')
    setPagos(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function marcarPagado(id: number) {
    try {
      await api.patch(`/pagos/${id}/pagar`)
      toast.success('Pago registrado')
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pagos</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cuotas de administración, reservas y multas</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && pagos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            )}
            {pagos.map((pago) => (
              <TableRow key={pago.id_pago}>
                <TableCell>{pago.tipo_pago}</TableCell>
                <TableCell>
                  {Number(pago.valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell>{pago.fecha_vencimiento}</TableCell>
                <TableCell>
                  <StatusBadge estado={pago.estado} />
                </TableCell>
                <TableCell className="text-right">
                  {pago.estado === 'pendiente' && (
                    <Button size="sm" variant="outline" onClick={() => marcarPagado(pago.id_pago)}>
                      Marcar pagado
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
