from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Domicilio, Usuario, Visita, Visitante
from app.schemas import VisitaCreate, VisitaOut
from app.security import get_current_user

router = APIRouter(prefix="/visitas", tags=["visitas"])


@router.get("", response_model=list[VisitaOut])
def listar_visitas(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Visita)
    if current_user.rol not in ("Administrador", "Portero"):
        if current_user.id_apartamento is None:
            return []
        query = query.filter(Visita.id_apartamento == current_user.id_apartamento)
    return query.order_by(Visita.id_visita.desc()).all()


@router.post("", response_model=VisitaOut, status_code=201)
def registrar_visita(
    payload: VisitaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if payload.tipo_visita not in ("Visitante", "Domicilio"):
        raise HTTPException(status_code=400, detail="tipo_visita debe ser Visitante o Domicilio")

    visita = Visita(
        id_apartamento=payload.id_apartamento,
        id_usuario_autoriza=current_user.id_usuario,
        tipo_visita=payload.tipo_visita,
        pre_autorizada=True,
        estado="autorizado",
    )
    db.add(visita)
    db.flush()  # asigna id_visita sin cerrar la transacción

    if payload.tipo_visita == "Visitante":
        if not payload.nombre_visitante:
            raise HTTPException(status_code=400, detail="nombre_visitante es requerido")
        db.add(
            Visitante(
                id_visita=visita.id_visita,
                nombre_visitante=payload.nombre_visitante,
                documento_identidad=payload.documento_identidad,
                motivo_visita=payload.motivo_visita,
            )
        )
    else:
        if not payload.empresa:
            raise HTTPException(status_code=400, detail="empresa es requerida para Domicilio")
        db.add(
            Domicilio(
                id_visita=visita.id_visita,
                empresa=payload.empresa,
                repartidor_nombre=payload.repartidor_nombre,
                telefono_repartidor=payload.telefono_repartidor,
            )
        )

    db.commit()
    db.refresh(visita)
    return visita


@router.patch("/{id_visita}/ingreso", response_model=VisitaOut)
def registrar_ingreso(
    id_visita: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol not in ("Administrador", "Portero"):
        raise HTTPException(status_code=403, detail="Solo portería puede registrar ingresos")
    visita = db.query(Visita).filter(Visita.id_visita == id_visita).first()
    if visita is None:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    visita.id_usuario_registra = current_user.id_usuario
    visita.fecha_hora_ingreso = datetime.now(timezone.utc)
    db.commit()
    db.refresh(visita)
    return visita


@router.patch("/{id_visita}/salida", response_model=VisitaOut)
def registrar_salida(
    id_visita: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol not in ("Administrador", "Portero"):
        raise HTTPException(status_code=403, detail="Solo portería puede registrar salidas")
    visita = db.query(Visita).filter(Visita.id_visita == id_visita).first()
    if visita is None:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    visita.fecha_hora_salida = datetime.now(timezone.utc)
    visita.estado = "finalizado"
    db.commit()
    db.refresh(visita)
    return visita
