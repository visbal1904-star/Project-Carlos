from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Apartamento, Usuario
from app.schemas import ApartamentoOut
from app.security import get_current_user

router = APIRouter(prefix="/apartamentos", tags=["apartamentos"])


@router.get("", response_model=list[ApartamentoOut])
def listar_apartamentos(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    return (
        db.query(Apartamento)
        .filter(Apartamento.id_conjunto == current_user.id_conjunto)
        .all()
    )


@router.get("/{id_apartamento}", response_model=ApartamentoOut)
def obtener_apartamento(
    id_apartamento: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    apto = (
        db.query(Apartamento)
        .filter(
            Apartamento.id_apartamento == id_apartamento,
            Apartamento.id_conjunto == current_user.id_conjunto,
        )
        .first()
    )
    if apto is None:
        raise HTTPException(status_code=404, detail="Apartamento no encontrado")
    return apto
