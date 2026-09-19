from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario, ZonaComun
from app.schemas import ZonaComunOut
from app.security import get_current_user

router = APIRouter(prefix="/zonas-comunes", tags=["zonas-comunes"])


@router.get("", response_model=list[ZonaComunOut])
def listar_zonas(
    db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)
):
    return (
        db.query(ZonaComun)
        .filter(ZonaComun.id_conjunto == current_user.id_conjunto)
        .all()
    )
