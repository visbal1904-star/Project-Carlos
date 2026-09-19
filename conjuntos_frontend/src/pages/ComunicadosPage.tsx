import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

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
import type { Comunicado } from '@/lib/types'

export function ComunicadosPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Comunicado[]>([])
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')

  async function load() {
    const { data } = await api.get<Comunicado[]>('/comunicados')
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    try {
      await api.post('/comunicados', { titulo, contenido })
      toast.success('Comunicado publicado')
      setTitulo('')
      setContenido('')
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
          <h1 className="text-2xl font-semibold">Comunicados</h1>
          <p className="mt-1 text-sm text-muted-foreground">Avisos oficiales del conjunto</p>
        </div>
        {user?.rol === 'Administrador' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Publicar comunicado</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo comunicado</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contenido">Contenido</Label>
                  <textarea
                    id="contenido"
                    required
                    rows={5}
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Publicar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {items.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No hay comunicados publicados.
          </p>
        )}
        {items.map((item) => (
          <div key={item.id_comunicado} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold">{item.titulo}</h3>
              <p className="text-xs text-muted-foreground">{new Date(item.fecha_publicacion).toLocaleDateString('es-CO')}</p>
            </div>
            <p className="mt-2 text-sm text-foreground/80">{item.contenido}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
