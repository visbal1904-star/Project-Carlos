from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Paquete, Usuario
from app.schemas import PaqueteCreate, PaqueteOut
from app.security import get_current_user

router = APIRouter(prefix="/paquetes", tags=["paquetes"])


@router.get("", response_model=list[PaqueteOut])
def listar_paquetes(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    query = db.query(Paquete)
    if current_user.rol not in ("Administrador", "Portero"):
        if current_user.id_apartamento is None:
            return []
        query = query.filter(Paquete.id_apartamento == current_user.id_apartamento)
    return query.order_by(Paquete.id_paquete.desc()).all()


@router.post("", response_model=PaqueteOut, status_code=201)
def registrar_paquete(
    payload: PaqueteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol not in ("Administrador", "Portero"):
        raise HTTPException(status_code=403, detail="Solo portería puede registrar paquetes")
    paquete = Paquete(**payload.model_dump(), id_usuario_registra=current_user.id_usuario)
    db.add(paquete)
    db.commit()
    db.refresh(paquete)
    return paquete


@router.patch("/{id_paquete}/entregar", response_model=PaqueteOut)
def entregar_paquete(
    id_paquete: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol not in ("Administrador", "Portero"):
        raise HTTPException(status_code=403, detail="Solo portería puede entregar paquetes")
    paquete = db.query(Paquete).filter(Paquete.id_paquete == id_paquete).first()
    if paquete is None:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    paquete.estado = "entregado"
    paquete.fecha_hora_entrega = datetime.now(timezone.utc)
    db.commit()
    db.refresh(paquete)
    return paquete
