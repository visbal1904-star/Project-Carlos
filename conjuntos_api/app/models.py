from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class ConjuntoResidencial(Base):
    __tablename__ = "conjunto_residencial"

    id_conjunto = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(150), nullable=False)
    ciudad = Column(String(50), nullable=False)
    pais = Column(String(50), nullable=False, default="Colombia")
    nit = Column(String(20), unique=True)


class Apartamento(Base):
    __tablename__ = "apartamento"
    __table_args__ = (UniqueConstraint("id_conjunto", "torre", "numero"),)

    id_apartamento = Column(Integer, primary_key=True)
    id_conjunto = Column(Integer, ForeignKey("conjunto_residencial.id_conjunto"), nullable=False)
    torre = Column(String(10))
    numero = Column(String(10), nullable=False)
    piso = Column(Integer)


class Usuario(Base):
    __tablename__ = "usuario"
    __table_args__ = (
        CheckConstraint(
            "rol IN ('Residente_Principal','Residente_Familiar','Portero','Administrador')"
        ),
    )

    id_usuario = Column(Integer, primary_key=True)
    id_conjunto = Column(Integer, ForeignKey("conjunto_residencial.id_conjunto"), nullable=False)
    id_apartamento = Column(Integer, ForeignKey("apartamento.id_apartamento"))
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    telefono = Column(String(20))
    rol = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)


class Suscripcion(Base):
    __tablename__ = "suscripcion"

    id_suscripcion = Column(Integer, primary_key=True)
    id_conjunto = Column(Integer, ForeignKey("conjunto_residencial.id_conjunto"), nullable=False)
    plan = Column(String(30))
    modelo_cobro = Column(String(30))
    costo_mensual = Column(Numeric(10, 2))
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date)
    estado = Column(String(20), nullable=False, default="activa")


class Pago(Base):
    __tablename__ = "pago"

    id_pago = Column(Integer, primary_key=True)
    id_apartamento = Column(Integer, ForeignKey("apartamento.id_apartamento"), nullable=False)
    tipo_pago = Column(String(30), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    fecha_pago = Column(DateTime)
    fecha_vencimiento = Column(Date, nullable=False)
    estado = Column(String(20), nullable=False, default="pendiente")


class Visita(Base):
    __tablename__ = "visita"

    id_visita = Column(Integer, primary_key=True)
    id_apartamento = Column(Integer, ForeignKey("apartamento.id_apartamento"), nullable=False)
    id_usuario_autoriza = Column(Integer, ForeignKey("usuario.id_usuario"))
    id_usuario_registra = Column(Integer, ForeignKey("usuario.id_usuario"))
    tipo_visita = Column(String(20), nullable=False)
    codigo_qr = Column(String(50))
    pre_autorizada = Column(Boolean, nullable=False, default=False)
    fecha_hora_ingreso = Column(DateTime)
    fecha_hora_salida = Column(DateTime)
    estado = Column(String(20), nullable=False, default="pendiente")


class Visitante(Base):
    __tablename__ = "visitante"

    id_visita = Column(Integer, ForeignKey("visita.id_visita"), primary_key=True)
    nombre_visitante = Column(String(80), nullable=False)
    documento_identidad = Column(String(20))
    motivo_visita = Column(String(100))
    foto_url = Column(Text)


class Domicilio(Base):
    __tablename__ = "domicilio"

    id_visita = Column(Integer, ForeignKey("visita.id_visita"), primary_key=True)
    empresa = Column(String(50), nullable=False)
    repartidor_nombre = Column(String(80))
    telefono_repartidor = Column(String(20))


class ItemDomicilio(Base):
    __tablename__ = "item_domicilio"

    id_item = Column(Integer, primary_key=True)
    id_visita = Column(Integer, ForeignKey("domicilio.id_visita"), nullable=False)
    descripcion = Column(String(100), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)


class Paquete(Base):
    __tablename__ = "paquete"

    id_paquete = Column(Integer, primary_key=True)
    id_apartamento = Column(Integer, ForeignKey("apartamento.id_apartamento"), nullable=False)
    id_usuario_registra = Column(Integer, ForeignKey("usuario.id_usuario"))
    empresa_transportadora = Column(String(50), nullable=False)
    numero_guia = Column(String(50))
    foto_url = Column(Text)
    fecha_hora_recepcion = Column(DateTime, nullable=False, server_default=func.now())
    fecha_hora_entrega = Column(DateTime)
    estado = Column(String(20), nullable=False, default="recibido")


class ZonaComun(Base):
    __tablename__ = "zona_comun"

    id_zona = Column(Integer, primary_key=True)
    id_conjunto = Column(Integer, ForeignKey("conjunto_residencial.id_conjunto"), nullable=False)
    nombre = Column(String(50), nullable=False)
    capacidad_maxima = Column(Integer)
    costo_reserva = Column(Numeric(10, 2), default=0)


class Reserva(Base):
    __tablename__ = "reserva"

    id_reserva = Column(Integer, primary_key=True)
    id_zona = Column(Integer, ForeignKey("zona_comun.id_zona"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_pago = Column(Integer, ForeignKey("pago.id_pago"))
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    estado = Column(String(20), nullable=False, default="pendiente")


class Comunicado(Base):
    __tablename__ = "comunicado"

    id_comunicado = Column(Integer, primary_key=True)
    id_conjunto = Column(Integer, ForeignKey("conjunto_residencial.id_conjunto"), nullable=False)
    id_usuario_autor = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    titulo = Column(String(100), nullable=False)
    contenido = Column(Text, nullable=False)
    fecha_publicacion = Column(DateTime, nullable=False, server_default=func.now())
    alcance = Column(String(20), nullable=False, default="Todos")


class PQR(Base):
    __tablename__ = "pqr"

    id_pqr = Column(Integer, primary_key=True)
    id_conjunto = Column(Integer, ForeignKey("conjunto_residencial.id_conjunto"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_usuario_responde = Column(Integer, ForeignKey("usuario.id_usuario"))
    tipo = Column(String(20), nullable=False)
    asunto = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    respuesta = Column(Text)
    fecha_creacion = Column(DateTime, nullable=False, server_default=func.now())
    fecha_respuesta = Column(DateTime)
    estado = Column(String(20), nullable=False, default="abierto")
