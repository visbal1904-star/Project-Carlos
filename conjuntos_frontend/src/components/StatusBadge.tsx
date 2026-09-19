const STATUS_STYLES: Record<string, string> = {
  pagado: 'bg-success-bg text-success-fg',
  confirmada: 'bg-success-bg text-success-fg',
  cerrado: 'bg-success-bg text-success-fg',
  finalizado: 'bg-success-bg text-success-fg',
  entregado: 'bg-success-bg text-success-fg',
  activa: 'bg-success-bg text-success-fg',
  autorizado: 'bg-success-bg text-success-fg',

  pendiente: 'bg-warning-bg text-warning-fg',
  abierto: 'bg-warning-bg text-warning-fg',
  recibido: 'bg-warning-bg text-warning-fg',

  vencido: 'bg-danger-bg text-danger-fg',
  rechazado: 'bg-danger-bg text-danger-fg',
  cancelada: 'bg-danger-bg text-danger-fg',
  devuelto: 'bg-danger-bg text-danger-fg',
  expirado: 'bg-danger-bg text-danger-fg',

  en_proceso: 'bg-info-bg text-info-fg',
}

const LABELS: Record<string, string> = {
  en_proceso: 'En proceso',
}

export function StatusBadge({ estado }: { estado: string }) {
  const style = STATUS_STYLES[estado] ?? 'bg-muted text-muted-foreground'
  const label = LABELS[estado] ?? estado.charAt(0).toUpperCase() + estado.slice(1)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}
