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
import { api, apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { PQR } from '@/lib/types'

const TIPOS: PQR['tipo'][] = ['Peticion', 'Queja', 'Reclamo', 'Sugerencia']

export function PQRPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<PQR[]>([])
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState<PQR['tipo']>('Peticion')
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [respuestas, setRespuestas] = useState<Record<number, string>>({})

  async function load() {
    const { data } = await api.get<PQR[]>('/pqr')
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    try {
      await api.post('/pqr', { tipo, asunto, descripcion })
      toast.success('PQR enviada')
      setAsunto('')
      setDescripcion('')
      setOpen(false)
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  async function handleResponder(id: number) {
    const respuesta = respuestas[id]
    if (!respuesta) return
    try {
      await api.patch(`/pqr/${id}/responder`, { respuesta })
      toast.success('Respuesta enviada')
      load()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">PQR</h1>
          <p className="mt-1 text-sm text-muted-foreground">Peticiones, quejas, reclamos y sugerencias</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nueva PQR</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva PQR</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as PQR['tipo'])}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="asunto">Asunto</Label>
                <Input id="asunto" required value={asunto} onChange={(e) => setAsunto(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  required
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Enviar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 space-y-4">
        {items.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No tienes PQR registradas.
          </p>
        )}
        {items.map((item) => (
          <div key={item.id_pqr} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.tipo}</p>
                <h3 className="mt-0.5 font-semibold">{item.asunto}</h3>
              </div>
              <StatusBadge estado={item.estado} />
            </div>
            <p className="mt-2 text-sm text-foreground/80">{item.descripcion}</p>

            {item.respuesta && (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Respuesta:</p>
                <p className="text-foreground/80">{item.respuesta}</p>
              </div>
            )}

            {!item.respuesta && user?.rol === 'Administrador' && (
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Escribe una respuesta…"
                  value={respuestas[item.id_pqr] ?? ''}
                  onChange={(e) => setRespuestas({ ...respuestas, [item.id_pqr]: e.target.value })}
                />
                <Button size="sm" onClick={() => handleResponder(item.id_pqr)}>
                  Responder
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
