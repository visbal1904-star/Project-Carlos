from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Reserva, Usuario, ZonaComun
from app.schemas import ReservaCreate, ReservaOut
from app.security import get_current_user

router = APIRouter(prefix="/reservas", tags=["reservas"])


@router.get("", response_model=list[ReservaOut])
def listar_reservas(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Reserva)
    if current_user.rol != "Administrador":
        query = query.filter(Reserva.id_usuario == current_user.id_usuario)
    return query.order_by(Reserva.fecha.desc()).all()


@router.post("", response_model=ReservaOut, status_code=201)
def crear_reserva(
    payload: ReservaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if payload.hora_fin <= payload.hora_inicio:
        raise HTTPException(status_code=400, detail="hora_fin debe ser mayor a hora_inicio")

    zona = (
        db.query(ZonaComun)
        .filter(
            ZonaComun.id_zona == payload.id_zona,
            ZonaComun.id_conjunto == current_user.id_conjunto,
        )
        .first()
    )
    if zona is None:
        raise HTTPException(status_code=404, detail="Zona común no encontrada")

    reserva = Reserva(
        id_zona=payload.id_zona,
        id_usuario=current_user.id_usuario,
        fecha=payload.fecha,
        hora_inicio=payload.hora_inicio,
        hora_fin=payload.hora_fin,
        estado="confirmada",
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva
