from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Pago, Usuario
from app.schemas import PagoCreate, PagoOut
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/pagos", tags=["pagos"])


@router.get("", response_model=list[PagoOut])
def listar_pagos(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Pago)
    if current_user.rol not in ("Administrador",):
        if current_user.id_apartamento is None:
            return []
        query = query.filter(Pago.id_apartamento == current_user.id_apartamento)
    return query.all()


@router.post("", response_model=PagoOut, status_code=201)
def crear_pago(
    payload: PagoCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    pago = Pago(**payload.model_dump())
    db.add(pago)
    db.commit()
    db.refresh(pago)
    return pago


@router.patch("/{id_pago}/pagar", response_model=PagoOut)
def marcar_pagado(
    id_pago: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pago = db.query(Pago).filter(Pago.id_pago == id_pago).first()
    if pago is None:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    if current_user.rol != "Administrador" and pago.id_apartamento != current_user.id_apartamento:
        raise HTTPException(status_code=403, detail="No autorizado")
    pago.estado = "pagado"
    pago.fecha_pago = datetime.now(timezone.utc)
    db.commit()
    db.refresh(pago)
    return pago
