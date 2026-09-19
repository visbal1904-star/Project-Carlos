import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, apiErrorMessage } from '@/lib/api'
import type { Reserva, ZonaComun } from '@/lib/types'

export function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [zonas, setZonas] = useState<ZonaComun[]>([])
  const [open, setOpen] = useState(false)

  const [idZona, setIdZona] = useState('')
  const [fecha, setFecha] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')

  async function load() {
    const [{ data: r }, { data: z }] = await Promise.all([
      api.get<Reserva[]>('/reservas'),
      api.get<ZonaComun[]>('/zonas-comunes'),
    ])
    setReservas(r)
    setZonas(z)
    if (z.length > 0) setIdZona(String(z[0].id_zona))
  }

  useEffect(() => {
    load()
  }, [])

  function nombreZona(id: number) {
    return zonas.find((z) => z.id_zona === id)?.nombre ?? `Zona #${id}`
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    try {
      await api.post('/reservas', {
        id_zona: Number(idZona),
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      })
      toast.success('Reserva confirmada')
      setOpen(false)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reservas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Reserva las zonas comunes del conjunto</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nueva reserva</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva reserva</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Zona</Label>
                <select
                  value={idZona}
                  onChange={(e) => setIdZona(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {zonas.map((z) => (
                    <option key={z.id_zona} value={z.id_zona}>
                      {z.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fecha">Fecha</Label>
                <Input id="fecha" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hora_inicio">Hora inicio</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hora_fin">Hora fin</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    required
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Reservar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zona</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No tienes reservas.
                </TableCell>
              </TableRow>
            )}
            {reservas.map((r) => (
              <TableRow key={r.id_reserva}>
                <TableCell>{nombreZona(r.id_zona)}</TableCell>
                <TableCell>{r.fecha}</TableCell>
                <TableCell>
                  {r.hora_inicio} - {r.hora_fin}
                </TableCell>
                <TableCell>
                  <StatusBadge estado={r.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
