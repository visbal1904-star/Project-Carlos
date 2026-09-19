import boto3
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

_boto_session = boto3.Session(
    profile_name=settings.aws_profile, region_name=settings.aws_region
)
_rds_client = _boto_session.client("rds")


def _generate_iam_token() -> str:
    return _rds_client.generate_db_auth_token(
        DBHostname=settings.db_host,
        Port=settings.db_port,
        DBUsername=settings.db_user,
    )


engine = create_engine(
    f"postgresql+psycopg2://{settings.db_user}@{settings.db_host}:{settings.db_port}/{settings.db_name}",
    connect_args={"sslmode": "require"},
    pool_pre_ping=True,
    # Recicla conexiones antes de que un token IAM (vida de 15 min) pueda quedar viejo.
    pool_recycle=600,
)


@event.listens_for(engine, "do_connect")
def _inject_iam_token(dialect, conn_rec, cargs, cparams):
    cparams["password"] = _generate_iam_token()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
