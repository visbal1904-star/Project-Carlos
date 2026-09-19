from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PQR, Usuario
from app.schemas import PQRCreate, PQROut, PQRResponder
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/pqr", tags=["pqr"])


@router.get("", response_model=list[PQROut])
def listar_pqr(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    query = db.query(PQR)
    if current_user.rol != "Administrador":
        query = query.filter(PQR.id_usuario == current_user.id_usuario)
    return query.order_by(PQR.fecha_creacion.desc()).all()


@router.post("", response_model=PQROut, status_code=201)
def crear_pqr(
    payload: PQRCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pqr = PQR(
        id_conjunto=current_user.id_conjunto,
        id_usuario=current_user.id_usuario,
        **payload.model_dump(),
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)
    return pqr


@router.patch("/{id_pqr}/responder", response_model=PQROut)
def responder_pqr(
    id_pqr: int,
    payload: PQRResponder,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_admin),
):
    pqr = db.query(PQR).filter(PQR.id_pqr == id_pqr).first()
    if pqr is None:
        raise HTTPException(status_code=404, detail="PQR no encontrada")
    pqr.respuesta = payload.respuesta
    pqr.id_usuario_responde = admin.id_usuario
    pqr.fecha_respuesta = datetime.now(timezone.utc)
    pqr.estado = "cerrado"
    db.commit()
    db.refresh(pqr)
    return pqr
