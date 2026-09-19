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
import { useAuth } from '@/lib/auth'
import type { Visita } from '@/lib/types'

export function VisitasPage() {
  const { user } = useAuth()
  const esPortero = user?.rol === 'Portero' || user?.rol === 'Administrador'

  const [visitas, setVisitas] = useState<Visita[]>([])
  const [open, setOpen] = useState(false)
  const [tipoVisita, setTipoVisita] = useState<'Visitante' | 'Domicilio'>('Visitante')
  const [nombreVisitante, setNombreVisitante] = useState('')
  const [empresa, setEmpresa] = useState('')

  async function load() {
    const { data } = await api.get<Visita[]>('/visitas')
    setVisitas(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!user?.id_apartamento) {
      toast.error('Tu usuario no tiene un apartamento asociado')
      return
    }
    try {
      await api.post('/visitas', {
        id_apartamento: user.id_apartamento,
        tipo_visita: tipoVisita,
        nombre_visitante: tipoVisita === 'Visitante' ? nombreVisitante : undefined,
        empresa: tipoVisita === 'Domicilio' ? empresa : undefined,
      })
      toast.success('Visita autorizada')
      setNombreVisitante('')
      setEmpresa('')
      setOpen(false)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  async function registrarIngreso(id: number) {
    try {
      await api.patch(`/visitas/${id}/ingreso`)
      toast.success('Ingreso registrado')
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  async function registrarSalida(id: number) {
    try {
      await api.patch(`/visitas/${id}/salida`)
      toast.success('Salida registrada')
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Visitas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visitantes y domicilios autorizados</p>
        </div>
        {!esPortero && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Autorizar visita</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Autorizar visita</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <select
                    value={tipoVisita}
                    onChange={(e) => setTipoVisita(e.target.value as 'Visitante' | 'Domicilio')}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Visitante">Visitante</option>
                    <option value="Domicilio">Domicilio</option>
                  </select>
                </div>
                {tipoVisita === 'Visitante' ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre_visitante">Nombre del visitante</Label>
                    <Input
                      id="nombre_visitante"
                      required
                      value={nombreVisitante}
                      onChange={(e) => setNombreVisitante(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="empresa">Empresa (Rappi, Servientrega…)</Label>
                    <Input id="empresa" required value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit">Autorizar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Ingreso</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Estado</TableHead>
              {esPortero && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay visitas registradas.
                </TableCell>
              </TableRow>
            )}
            {visitas.map((v) => (
              <TableRow key={v.id_visita}>
                <TableCell>{v.tipo_visita}</TableCell>
                <TableCell>{v.fecha_hora_ingreso ?? '—'}</TableCell>
                <TableCell>{v.fecha_hora_salida ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge estado={v.estado} />
                </TableCell>
                {esPortero && (
                  <TableCell className="text-right">
                    {!v.fecha_hora_ingreso && (
                      <Button size="sm" variant="outline" onClick={() => registrarIngreso(v.id_visita)}>
                        Registrar ingreso
                      </Button>
                    )}
                    {v.fecha_hora_ingreso && !v.fecha_hora_salida && (
                      <Button size="sm" variant="outline" onClick={() => registrarSalida(v.id_visita)}>
                        Registrar salida
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
