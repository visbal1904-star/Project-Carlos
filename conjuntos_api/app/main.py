from fastapi import FastAPI

from app.routers import (
    apartamentos,
    auth,
    comunicados,
    paquetes,
    pagos,
    pqr,
    reservas,
    visitas,
    zonas_comunes,
)

app = FastAPI(
    title="Conjuntos Residenciales API",
    description="API para administración de conjuntos residenciales: usuarios, pagos, visitas, paquetes, reservas, comunicados y PQR.",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(apartamentos.router)
app.include_router(pagos.router)
app.include_router(visitas.router)
app.include_router(paquetes.router)
app.include_router(zonas_comunes.router)
app.include_router(reservas.router)
app.include_router(comunicados.router)
app.include_router(pqr.router)


@app.get("/health")
def health():
    return {"status": "ok"}
