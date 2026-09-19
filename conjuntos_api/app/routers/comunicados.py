from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Comunicado, Usuario
from app.schemas import ComunicadoCreate, ComunicadoOut
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/comunicados", tags=["comunicados"])


@router.get("", response_model=list[ComunicadoOut])
def listar_comunicados(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    return (
        db.query(Comunicado)
        .filter(Comunicado.id_conjunto == current_user.id_conjunto)
        .order_by(Comunicado.fecha_publicacion.desc())
        .all()
    )


@router.post("", response_model=ComunicadoOut, status_code=201)
def crear_comunicado(
    payload: ComunicadoCreate,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_admin),
):
    comunicado = Comunicado(
        id_conjunto=admin.id_conjunto,
        id_usuario_autor=admin.id_usuario,
        **payload.model_dump(),
    )
    db.add(comunicado)
    db.commit()
    db.refresh(comunicado)
    return comunicado
