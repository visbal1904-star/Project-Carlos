export type Rol = 'Residente_Principal' | 'Residente_Familiar' | 'Portero' | 'Administrador'

export interface Usuario {
  id_usuario: number
  id_conjunto: number
  id_apartamento: number | null
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  rol: Rol
}

export interface Apartamento {
  id_apartamento: number
  id_conjunto: number
  torre: string | null
  numero: string
  piso: number | null
}

export interface Pago {
  id_pago: number
  id_apartamento: number
  tipo_pago: 'Administracion' | 'Reserva_Zona' | 'Multa'
  valor: string
  fecha_pago: string | null
  fecha_vencimiento: string
  estado: 'pendiente' | 'pagado' | 'vencido'
}

export interface Visita {
  id_visita: number
  id_apartamento: number
  tipo_visita: 'Visitante' | 'Domicilio'
  codigo_qr: string | null
  pre_autorizada: boolean
  fecha_hora_ingreso: string | null
  fecha_hora_salida: string | null
  estado: 'pendiente' | 'autorizado' | 'rechazado' | 'finalizado' | 'expirado'
}

export interface Paquete {
  id_paquete: number
  id_apartamento: number
  empresa_transportadora: string
  numero_guia: string | null
  fecha_hora_recepcion: string
  fecha_hora_entrega: string | null
  estado: 'recibido' | 'entregado' | 'devuelto'
}

export interface ZonaComun {
  id_zona: number
  nombre: string
  capacidad_maxima: number | null
  costo_reserva: string
}

export interface Reserva {
  id_reserva: number
  id_zona: number
  id_usuario: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
}

export interface Comunicado {
  id_comunicado: number
  titulo: string
  contenido: string
  fecha_publicacion: string
  alcance: 'Todos' | 'Apartamento_Especifico'
}

export interface PQR {
  id_pqr: number
  tipo: 'Peticion' | 'Queja' | 'Reclamo' | 'Sugerencia'
  asunto: string
  descripcion: string
  respuesta: string | null
  fecha_creacion: string
  fecha_respuesta: string | null
  estado: 'abierto' | 'en_proceso' | 'cerrado'
}
