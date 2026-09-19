from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Apartamento, Usuario
from app.schemas import LoginRequest, RegistroRequest, Token, UsuarioOut
from app.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/registro", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registro(payload: RegistroRequest, db: Session = Depends(get_db)):
    apartamento = (
        db.query(Apartamento)
        .filter(Apartamento.id_apartamento == payload.id_apartamento)
        .first()
    )
    if apartamento is None:
        raise HTTPException(status_code=404, detail="El apartamento indicado no existe")

    email_existente = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if email_existente is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario registrado con ese email",
        )

    usuario = Usuario(
        id_conjunto=apartamento.id_conjunto,
        id_apartamento=apartamento.id_apartamento,
        nombre=payload.nombre,
        apellido=payload.apellido,
        email=payload.email,
        telefono=payload.telefono,
        rol=payload.rol,
        password_hash=hash_password(payload.password),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    token = create_access_token(subject=str(user.id_usuario))
    return Token(access_token=token)


@router.get("/me", response_model=UsuarioOut)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user
