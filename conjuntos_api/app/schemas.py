from datetime import date, datetime, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_usuario: int
    id_conjunto: int
    id_apartamento: int | None
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str | None
    rol: str


# ---------- Apartamento ----------
class ApartamentoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_apartamento: int
    id_conjunto: int
    torre: str | None
    numero: str
    piso: int | None


# ---------- Pago ----------
class PagoCreate(BaseModel):
    id_apartamento: int
    tipo_pago: Literal["Administracion", "Reserva_Zona", "Multa"]
    valor: Decimal
    fecha_vencimiento: date


class PagoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_pago: int
    id_apartamento: int
    tipo_pago: str
    valor: Decimal
    fecha_pago: datetime | None
    fecha_vencimiento: date
    estado: str


# ---------- Visita ----------
class VisitaCreate(BaseModel):
    id_apartamento: int
    tipo_visita: Literal["Visitante", "Domicilio"]
    nombre_visitante: str | None = None
    documento_identidad: str | None = None
    motivo_visita: str | None = None
    empresa: str | None = None
    repartidor_nombre: str | None = None
    telefono_repartidor: str | None = None


class VisitaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_visita: int
    id_apartamento: int
    tipo_visita: str
    codigo_qr: str | None
    pre_autorizada: bool
    fecha_hora_ingreso: datetime | None
    fecha_hora_salida: datetime | None
    estado: str


# ---------- Paquete ----------
class PaqueteCreate(BaseModel):
    id_apartamento: int
    empresa_transportadora: str
    numero_guia: str | None = None


class PaqueteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_paquete: int
    id_apartamento: int
    empresa_transportadora: str
    numero_guia: str | None
    fecha_hora_recepcion: datetime
    fecha_hora_entrega: datetime | None
    estado: str


# ---------- Zona Comun ----------
class ZonaComunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_zona: int
    nombre: str
    capacidad_maxima: int | None
    costo_reserva: Decimal


# ---------- Reserva ----------
class ReservaCreate(BaseModel):
    id_zona: int
    fecha: date
    hora_inicio: time
    hora_fin: time


class ReservaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_reserva: int
    id_zona: int
    id_usuario: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: str


# ---------- Comunicado ----------
class ComunicadoCreate(BaseModel):
    titulo: str
    contenido: str
    alcance: Literal["Todos", "Apartamento_Especifico"] = "Todos"


class ComunicadoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_comunicado: int
    titulo: str
    contenido: str
    fecha_publicacion: datetime
    alcance: str


# ---------- PQR ----------
class PQRCreate(BaseModel):
    tipo: Literal["Peticion", "Queja", "Reclamo", "Sugerencia"]
    asunto: str
    descripcion: str


class PQRResponder(BaseModel):
    respuesta: str


class PQROut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_pqr: int
    tipo: str
    asunto: str
    descripcion: str
    respuesta: str | None
    fecha_creacion: datetime
    fecha_respuesta: datetime | None
    estado: str
